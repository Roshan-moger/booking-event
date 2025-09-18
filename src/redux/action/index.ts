

export const UPDATE_AUTH_DATA = "UPDATE_AUTH_DATA";
 export const CLEAR_AUTH="CLEAR_AUTH"
 export const ACTION= "ACTION";
export const update_auth_data = (
 payload: {
    token: string;
    roles: string[];
    email: string;
  }
) => ({
  type: UPDATE_AUTH_DATA,
  payload,
});

export const clear_auth = () => ({
  type: CLEAR_AUTH,
});


export const update_action= ( payload: string)=>({
  type: ACTION,
  payload
})