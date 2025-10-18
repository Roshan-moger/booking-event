export interface InitialReduxStateProps {
  tokenInfo: {
    accessToken: string;
    expiryTime: string;
    email: string;
    roles: string[];
    name: string;
  };
  activePath: string;
}
