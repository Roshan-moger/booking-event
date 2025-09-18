import type { AnyAction } from "redux";
import { CLEAR_AUTH, UPDATE_AUTH_DATA, ACTION } from "../action";
import type { InitialReduxStateProps } from "../redux.props";

const initialState: InitialReduxStateProps = {
  tokenInfo: {
    accessToken: "",
    expiryTime: "",
    email: "",
    roles: [],
  },
  action: "edit"
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
        },
      };
      case ACTION:
        return{
          ...state,
          action: action.payload
        }
      case CLEAR_AUTH:
  return initialState;
    default:
      return state;
  }
}
