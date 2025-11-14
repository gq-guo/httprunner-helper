class AITest:
    def __init__(self, testcase_path):
        self.testcase_path = testcase_path

    def run(self, config: dict):
        config["path"] = "${calculate_signature(data, 'secret_key')}"
        config["path_1"] = "apis/user/login copy.yaml"
        config["path_2"] = "apis/base.yaml"

    def get_testcase(self):
        pass

    def get_testcase_path(self):
        pass
