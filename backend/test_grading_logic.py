"""
Unit test for BehavioralGrader override logic.
Tests the grade_lab function's logic WITHOUT real network connections.
We mock the BehavioralGrader.grade() and BaseGrader.grade() methods.
"""
import sys
import os
import unittest
from unittest.mock import patch, MagicMock

sys.path.insert(0, "/app")
from grading_engine import grade_lab


# ── Scenario helpers ────────────────────────────────────────────────────────

def make_config_result(node, passed, missing=None):
    return {"node": node, "passed": passed, "missing_lines": missing or [], "error": "" if passed else ""}

def make_behavioral_result(node, passed, missing=None):
    return {"node": node, "passed": passed, "missing_lines": missing or []}


# ── Tests ────────────────────────────────────────────────────────────────────

class TestBehavioralOverride(unittest.TestCase):

    def setUp(self):
        # Minimal lab definition injected directly
        self.lab_def = {
            "lab": {
                "id": "test-lab",
                "title": "Test ROAS-1",
                "nodes": [
                    {"name": "R1", "host": "127.0.0.1", "console_port": 5000, "device_type": "cisco_ios_telnet"},
                    {"name": "SW1", "host": "127.0.0.1", "console_port": 5001, "device_type": "cisco_iol_l2"},
                    {"name": "PC1", "host": "127.0.0.1", "console_port": 5002, "device_type": "vpcs"},
                    {"name": "PC2", "host": "127.0.0.1", "console_port": 5003, "device_type": "vpcs"},
                ],
                "checks": [
                    {"node": "PC1", "type": "ping", "target": "192.168.20.2", "description": "PC1 pings PC2"},
                    {"node": "PC2", "type": "ping", "target": "192.168.10.2", "description": "PC2 pings PC1"},
                ]
            }
        }

    @patch("grading_engine.load_lab_definition")
    @patch("grading_engine.BehavioralGrader")
    @patch("grading_engine.get_grader_for_device")
    def test_scenario_1_behavioral_pass_overrides_config_fail(
        self, mock_get_grader, mock_behavioral_cls, mock_load
    ):
        """
        Scenario: Config check fails (wrong DHCP pool name) but ping checks pass.
        EXPECTED: Lab passes (100%) because behavioral override kicks in.
        """
        mock_load.return_value = self.lab_def

        # R1 config fails, SW1 passes, PC1/PC2 have no .cfg files
        def config_side_effect(node_name, node_config, solution_path):
            grader = MagicMock()
            if node_name == "R1":
                grader.grade.return_value = {"node": "R1", "passed": False, "missing_lines": ["ip dhcp pool VLAN10"], "error": ""}
            elif node_name == "SW1":
                grader.grade.return_value = {"node": "SW1", "passed": True, "missing_lines": [], "error": ""}
            else:
                grader.grade.return_value = {"node": node_name, "passed": True, "error": "No solution file found. Skipping.", "missing_lines": []}
            return grader
        mock_get_grader.side_effect = config_side_effect

        # Behavioral checks: both PCs ping successfully
        def behavioral_side_effect(node_name, node_config, checks):
            b = MagicMock()
            b.grade.return_value = {"node": node_name, "passed": True, "missing_lines": []}
            return b
        mock_behavioral_cls.side_effect = behavioral_side_effect

        result = grade_lab("/fake/path/lab.yaml", lab_dir="/fake/path")

        print(f"\n[Scenario 1] passed={result['passed']}, score={result['percentage']}%")
        for r in result["node_results"]:
            print(f"  {r['node']}: passed={r['passed']}, missing={r.get('missing_lines', [])}")

        self.assertTrue(result["passed"], "Lab should PASS because behavioral checks passed")
        self.assertEqual(result["percentage"], 100)

    @patch("grading_engine.load_lab_definition")
    @patch("grading_engine.BehavioralGrader")
    @patch("grading_engine.get_grader_for_device")
    def test_scenario_2_behavioral_fail_blocks_pass(
        self, mock_get_grader, mock_behavioral_cls, mock_load
    ):
        """
        Scenario: Config checks all pass, but pings fail (network broken).
        EXPECTED: Lab fails because behavioral checks did not pass.
        """
        mock_load.return_value = self.lab_def

        def config_side_effect(node_name, node_config, solution_path):
            grader = MagicMock()
            grader.grade.return_value = {"node": node_name, "passed": True, "missing_lines": [], "error": ""}
            return grader
        mock_get_grader.side_effect = config_side_effect

        # Behavioral checks: pings FAIL
        def behavioral_side_effect(node_name, node_config, checks):
            b = MagicMock()
            b.grade.return_value = {
                "node": node_name, "passed": False,
                "missing_lines": [f"Connectivity: {node_name} ping failed."]
            }
            return b
        mock_behavioral_cls.side_effect = behavioral_side_effect

        result = grade_lab("/fake/path/lab.yaml", lab_dir="/fake/path")

        print(f"\n[Scenario 2] passed={result['passed']}, score={result['percentage']}%")
        for r in result["node_results"]:
            print(f"  {r['node']}: passed={r['passed']}, missing={r.get('missing_lines', [])}")

        self.assertFalse(result["passed"], "Lab should FAIL because pings failed")
        self.assertEqual(result["percentage"], 0)

    @patch("grading_engine.load_lab_definition")
    @patch("grading_engine.get_grader_for_device")
    def test_scenario_3_no_behavioral_checks_config_decides(
        self, mock_get_grader, mock_load
    ):
        """
        Scenario: Lab has NO behavioral checks defined. Config grading alone decides.
        EXPECTED: Lab fails if config fails (original behavior unchanged).
        """
        lab_def_no_checks = dict(self.lab_def)
        lab_def_no_checks["lab"] = dict(self.lab_def["lab"])
        lab_def_no_checks["lab"].pop("checks", None)  # remove checks entirely
        mock_load.return_value = lab_def_no_checks

        def config_side_effect(node_name, node_config, solution_path):
            grader = MagicMock()
            if node_name == "R1":
                grader.grade.return_value = {"node": "R1", "passed": False, "missing_lines": ["ip dhcp pool VLAN10"], "error": ""}
            else:
                grader.grade.return_value = {"node": node_name, "passed": True, "missing_lines": [], "error": "No solution file found. Skipping."}
            return grader
        mock_get_grader.side_effect = config_side_effect

        result = grade_lab("/fake/path/lab.yaml", lab_dir="/fake/path")

        print(f"\n[Scenario 3] passed={result['passed']}, score={result['percentage']}%")
        for r in result["node_results"]:
            print(f"  {r['node']}: passed={r['passed']}, missing={r.get('missing_lines', [])}")

        self.assertFalse(result["passed"], "Lab should FAIL because no behavioral override and config failed")
        self.assertEqual(result["percentage"], 0)


if __name__ == "__main__":
    unittest.main(verbosity=2)
