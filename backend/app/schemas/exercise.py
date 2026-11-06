from pydantic import BaseModel, ConfigDict


class ExerciseCreate(BaseModel):
    name: str
    category: str
    description: str | None = None
    duration: int


class ExerciseResponse(BaseModel):
    id: int
    name: str
    category: str
    description: str | None
    duration: int

    model_config = ConfigDict(from_attributes=True)