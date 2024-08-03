""""""
from penflowapi import models


class PenflowError(Exception):
    message: str
    """"""


class PenflowBootError(PenflowError):
    """"""
    def __init__(self, details: str):
        self.message = f"Bootstrap error: {details}."


class PenflowValidationError(PenflowError):
    """"""
    def __init__(self, details: str):
        self.message = f"Validation error: {details}."


class InvalidMessageError(PenflowValidationError):
    """"""

    def __init__(self, message_type: str):
        super().__init__(f"{message_type} is not a valid message type.")
        self.message_type = message_type


class BadMessageError(PenflowValidationError):
    """"""

    def __init__(self, message_type: str, data: list[str]):
        super().__init__(f"Attributes {','.join(data)} are missing for message type '{message_type}'.")
        self.message_type = message_type
        self.data = data


class ModelNotFoundError(PenflowValidationError):
    """"""
    def __init__(self, model: str, model_id: str):
        self.message = f"Model {model} with id {model_id} not found."
        self.model_id = model_id


class FlowSemanticError(PenflowValidationError):
    """"""
    def __init__(self, errors: list[models.FlowError]):
        super().__init__("Flow has semantic errors")
        self.errors = errors


class BadModelError(PenflowValidationError):
    """"""
    def __init__(self, data: list[str]):
        self.message = f"Attributes {','.join(data)} {'is' if len(data) == 1 else 'are'} not valid."
        self.data = data

