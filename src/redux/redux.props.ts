export interface InitialReduxStateProps {
  tokenInfo: {
    accessToken: string;
    expiryTime: string;
    email: string;
    roles: string[];
  };
  activePath: string;
}
