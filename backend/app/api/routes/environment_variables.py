import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import col, func, select

from app.api.deps import CurrentUser, SessionDep
from app.crud import get_user_team_link
from app.models import (
    App,
    EnvironmentVariable,
    EnvironmentVariableCreate,
    EnvironmentVariablePublic,
    EnvironmentVariablesPublic,
    EnvironmentVariableUpdate,
    Message,
)
from app.utils import get_datetime_utc

router = APIRouter(prefix="/{app_id}/environment-variables")


@router.get("/", response_model=EnvironmentVariablesPublic)
def read_environment_variables(
    session: SessionDep,
    current_user: CurrentUser,
    app_id: uuid.UUID,
) -> Any:
    """
    Retrieve a list of environment variables for the provided app.
    """

    app = session.exec(select(App).where(App.id == app_id)).first()

    if not app:
        raise HTTPException(status_code=404, detail="App not found")

    user_team_link = get_user_team_link(
        session=session, user_id=current_user.id, team_id=app.team_id
    )
    if not user_team_link:
        raise HTTPException(
            status_code=404, detail="Team not found for the current user"
        )

    count_statement = (
        select(func.count())
        .where(EnvironmentVariable.app_id == app_id)
        .select_from(EnvironmentVariable)
    )
    statement = (
        select(EnvironmentVariable)
        .where(EnvironmentVariable.app_id == app_id)
        .order_by(EnvironmentVariable.name)
    )

    environment_variables = session.exec(statement).all()
    count = session.exec(count_statement).one()

    return EnvironmentVariablesPublic(data=environment_variables, count=count)


@router.post("/", response_model=EnvironmentVariablePublic, status_code=201)
def create_environment_variable(
    session: SessionDep,
    current_user: CurrentUser,
    app_id: uuid.UUID,
    environment_variable_in: EnvironmentVariableCreate,
) -> Any:
    """
    Create a new environment variable for the provided app.
    """

    app = session.exec(select(App).where(App.id == app_id)).first()

    if not app:
        raise HTTPException(status_code=404, detail="App not found")

    user_team_link = get_user_team_link(
        session=session, user_id=current_user.id, team_id=app.team_id
    )
    if not user_team_link:
        raise HTTPException(
            status_code=404, detail="Team not found for the current user"
        )

    environment_variable = EnvironmentVariable(
        app_id=app_id,
        name=environment_variable_in.name,
        value=environment_variable_in.value,
    )

    environment_variable_already_exists = session.exec(
        select(func.count())
        .select_from(EnvironmentVariable)
        .where(
            col(EnvironmentVariable.name) == environment_variable.name,
            col(EnvironmentVariable.app_id) == app_id,
        )
    ).one()

    if environment_variable_already_exists:
        raise HTTPException(
            status_code=400,
            detail="An environment variable with the provided name already exists",
        )

    app.updated_at = get_datetime_utc()

    session.add(environment_variable)
    session.add(app)
    session.commit()

    session.refresh(environment_variable)

    return environment_variable


@router.patch("/", response_model=EnvironmentVariablesPublic)
def update_environment_variables(
    session: SessionDep,
    current_user: CurrentUser,
    app_id: uuid.UUID,
    environment_variables_in: dict[str, str | None],
) -> Any:
    """
    Update the provided environment variables.
    """

    app = session.exec(select(App).where(App.id == app_id)).first()

    if not app:
        raise HTTPException(status_code=404, detail="App not found")

    user_team_link = get_user_team_link(
        session=session, user_id=current_user.id, team_id=app.team_id
    )
    if not user_team_link:
        raise HTTPException(
            status_code=404, detail="Team not found for the current user"
        )

    for name, value in environment_variables_in.items():
        environment_variable = session.exec(
            select(EnvironmentVariable).where(
                EnvironmentVariable.app_id == app_id,
                EnvironmentVariable.name == name,
            )
        ).first()

        if value is None:
            session.delete(environment_variable)

        else:
            if not environment_variable:
                environment_variable = EnvironmentVariable(
                    app_id=app_id,
                    name=name,
                    value=value,
                )

            environment_variable.value = value

            session.add(environment_variable)

    app.updated_at = get_datetime_utc()
    session.add(app)
    session.commit()

    count_statement = (
        select(func.count())
        .where(EnvironmentVariable.app_id == app_id)
        .select_from(EnvironmentVariable)
    )
    statement = (
        select(EnvironmentVariable)
        .where(EnvironmentVariable.app_id == app_id)
        .order_by(EnvironmentVariable.name)
    )

    environment_variables = session.exec(statement).all()
    count = session.exec(count_statement).one()

    return EnvironmentVariablesPublic(data=environment_variables, count=count)


@router.delete("/{environment_variable_name}", response_model=Message)
def delete_environment_variable(
    session: SessionDep,
    current_user: CurrentUser,
    app_id: uuid.UUID,
    environment_variable_name: str,
) -> Any:
    """
    Delete the provided environment variable.
    """

    app = session.exec(select(App).where(App.id == app_id)).first()

    if not app:
        raise HTTPException(status_code=404, detail="App not found")

    user_team_link = get_user_team_link(
        session=session, user_id=current_user.id, team_id=app.team_id
    )
    if not user_team_link:
        raise HTTPException(
            status_code=404, detail="Team not found for the current user"
        )

    environment_variable = session.exec(
        select(EnvironmentVariable).where(
            EnvironmentVariable.app_id == app_id,
            EnvironmentVariable.name == environment_variable_name,
        )
    ).first()

    if not environment_variable:
        raise HTTPException(status_code=404, detail="Environment variable not found")

    app.updated_at = get_datetime_utc()

    session.delete(environment_variable)
    session.add(app)
    session.commit()

    return Message(message="Environment variable deleted")


@router.put("/{environment_variable_name}", response_model=EnvironmentVariablePublic)
def update_environment_variable(
    session: SessionDep,
    current_user: CurrentUser,
    app_id: uuid.UUID,
    environment_variable_name: str,
    environment_variable_in: EnvironmentVariableUpdate,
) -> Any:
    """
    Update the provided environment variable.
    """

    app = session.exec(select(App).where(App.id == app_id)).first()

    if not app:
        raise HTTPException(status_code=404, detail="App not found")

    user_team_link = get_user_team_link(
        session=session, user_id=current_user.id, team_id=app.team_id
    )
    if not user_team_link:
        raise HTTPException(
            status_code=404, detail="Team not found for the current user"
        )

    environment_variable = session.exec(
        select(EnvironmentVariable).where(
            EnvironmentVariable.app_id == app_id,
            EnvironmentVariable.name == environment_variable_name,
        )
    ).first()

    if not environment_variable:
        raise HTTPException(status_code=404, detail="Environment variable not found")

    if environment_variable_in.value:
        environment_variable.value = environment_variable_in.value

    app.updated_at = get_datetime_utc()

    session.add(environment_variable)
    session.add(app)
    session.commit()

    session.refresh(environment_variable)

    return environment_variable
