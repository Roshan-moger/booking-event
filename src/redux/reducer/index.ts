import type { AnyAction } from "redux";
import { CLEAR_AUTH, UPDATE_AUTH_DATA, UPADATE_PATH } from "../action";
import type { InitialReduxStateProps } from "../redux.props";

const initialState: InitialReduxStateProps = {
  tokenInfo: {
    accessToken: "",
    expiryTime: "",
    email: "",
    roles: [],
    name : ""
  },
  activePath: "",
};

export default function authReducer(state = initialState, action: AnyAction) {
  switch (action.type) {
    case UPDATE_AUTH_DATA:
      return {
        ...state,
        tokenInfo: {
          accessToken: action.payload.token, // match your action payload
          email: action.payload.email,
          roles: action.payload.roles,
          expiryTime: action.payload.expiryTime || "",
          name: action.payload.name || ""
        },
      };

    case CLEAR_AUTH:
      return initialState;
    case UPADATE_PATH:
      return {
        ...state,
        activePath: action.payload,
      };
    default:
      return state;
  }
}
