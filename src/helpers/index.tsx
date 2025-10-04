import { useEffect } from "react"
import { useMap } from "react-leaflet"
import L from "leaflet"
import { Navigate } from "react-router-dom"


export interface Seat {
  row: string
  number: number
  categoryId: string
  categoryName: string
  price: number
  status: "AVAILABLE" | "BOOKED" | "SELECTED"
}
export type SeatStatus = "AVAILABLE" | "BOOKED" | string


export interface Event {
  id: number
  title: string
  description: string
  categoryName: string
  ratings: number
  status: "ACTIVE" | "INACTIVE" | string
  imageUrls?: string[]
  startDate: string
  endDate: string
  venueName: string
  venueId?: number | string
  rows: number
  columns: number
  seatingType: string
  capacity: number
  totalSeats: number
  seats?: Seat[]
  ticketPrice: number
  organizerFeeAmount: number
  organizerFeeStatus: "PAID" | "UNPAID" | string
  mode: string
  hasActiveAd?: boolean
}

export interface BookingData {
  eventId: number
  selectedSeats: Seat[]
  totalAmount: number
  userDetails: {
    name: string
    email: string
    phone: string
  }
}

// Custom map control buttons component
 export const MapControls = () => {
  const map = useMap()

  // Move map on button click
  const moveMap = (dx: number, dy: number) => {
    const center = map.getCenter()
    const newLat = center.lat + dy
    const newLng = center.lng + dx
    map.setView([newLat, newLng], map.getZoom())
  }

  useEffect(() => {
    const controlDiv = L.DomUtil.create("div", "leaflet-control leaflet-bar custom-controls")
    controlDiv.style.backgroundColor = "#fff"
    controlDiv.style.borderRadius = "8px"
    controlDiv.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.2)"
    controlDiv.style.padding = "4px"
    controlDiv.style.display = "flex"
    controlDiv.style.flexDirection = "column"
    controlDiv.style.gap = "4px"

   // Create buttons
const moveStep = 0.05; // ⬅️ Increased movement step

const upBtn = L.DomUtil.create("button", "", controlDiv);
upBtn.innerHTML = "⬆️";
upBtn.style.cursor = "pointer";
upBtn.style.fontSize = "18px"; // Bigger icon
upBtn.style.padding = "6px";
upBtn.onclick = () => moveMap(0, moveStep);

const leftBtn = L.DomUtil.create("button", "", controlDiv);
leftBtn.innerHTML = "⬅️";
leftBtn.style.cursor = "pointer";
leftBtn.style.fontSize = "18px";
leftBtn.style.padding = "6px";
leftBtn.onclick = () => moveMap(-moveStep, 0);

const rightBtn = L.DomUtil.create("button", "", controlDiv);
rightBtn.innerHTML = "➡️";
rightBtn.style.cursor = "pointer";
rightBtn.style.fontSize = "18px";
rightBtn.style.padding = "6px";
rightBtn.onclick = () => moveMap(moveStep, 0);

const downBtn = L.DomUtil.create("button", "", controlDiv);
downBtn.innerHTML = "⬇️";
downBtn.style.cursor = "pointer";
downBtn.style.fontSize = "18px";
downBtn.style.padding = "6px";
downBtn.onclick = () => moveMap(0, -moveStep);


    const customControl = new L.Control({ position: "topright" })
    customControl.onAdd = () => controlDiv
    customControl.addTo(map)

    return () => {
      map.removeControl(customControl)
    }
  }, [map])

  return null
}

 export function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
} 

export function base64ToFile(base64: string): File {
  // Determine MIME type from Base64 prefix
  let mimeType = '';
  if (base64.startsWith('data:image/jpeg')) mimeType = 'image/jpeg';
  else if (base64.startsWith('data:image/png')) mimeType = 'image/png';
  else if (base64.startsWith('data:image/svg')) mimeType = 'image/svg+xml';
  else throw new Error('Unsupported image type. Only JPEG, PNG, and SVG are allowed.');

  // Remove the prefix
  const data = base64.split(',')[1];
  const byteString = atob(data);
  const byteNumbers = new Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    byteNumbers[i] = byteString.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);

  // Return a File (you can give a default name)
  return new File([byteArray], `image.${mimeType.split('/')[1]}`, { type: mimeType });
}


interface UserData {
  sub: string;
  iat: number;
  exp: number;
  roles: string[];
}
const ProtectedRoute: React.FC<any> = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("accessToken")
    const userDataString  = localStorage.getItem("userData")
const userData: UserData | null = userDataString ? JSON.parse(userDataString) : null;
  const userRole = userData?.roles[0]

console.log(); 
   // or get from Redux

  if (!token) {
    return <Navigate to="/" replace /> // Not logged in
  }

  if (allowedRoles && !allowedRoles.includes(userRole || "")) {
    return <Navigate to="/404" replace /> // Role not allowed
  }

  return <>{children}</>
}

export default ProtectedRoute