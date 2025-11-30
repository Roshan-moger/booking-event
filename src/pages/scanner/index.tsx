import { useNavigate } from "react-router-dom";
import QRScanner from "./qr-scanner";
import { useSelector } from "react-redux";
import type { InitialReduxStateProps } from "../../redux/redux.props";

export default function Page() {
  const navigate = useNavigate();
  const role = useSelector(
    (state: InitialReduxStateProps) => state.tokenInfo.roles
  );

  const handleScan = (data: string) => {
    console.log("Scanned:", data);

    // If QR contains full URL → redirect browser
    if (data.startsWith("http://") || data.startsWith("https://")) {
      // remove both domains → keep only path


      if (role.includes("ORGANIZER")) {
              const path = data
        .replace("http://", "")
        .replace("https://", "")
        .replace("localhost:5173", "")
        .replace("spotfront.app.codevicesolution.in", "");
        navigate(path); // internal navigation
      } else {
        window.location.href = data; // external redirect
      }

      return;
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <QRScanner onScan={handleScan} />
    </main>
  );
}
