from typing import Literal

from pydantic import BaseModel


class BuildLogMessage(BaseModel):
    message: str
    type: Literal["message"] = "message"


class BuildLogComplete(BaseModel):
    type: Literal["complete"] = "complete"


class BuildLogFailed(BaseModel):
    type: Literal["failed"] = "failed"


type BuildLog = BuildLogMessage | BuildLogComplete | BuildLogFailed
