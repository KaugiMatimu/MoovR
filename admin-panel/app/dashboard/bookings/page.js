"use client";

import { useEffect, useState } from "react";
import { Eye, Trash, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import { BaseURL } from "@/utils/baseURL";
import { useRouter } from "next/navigation";


export default function BookingHistoryPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [bookings, setBookings] = useState(null)
  const [totalPages, setTotalPages]= useState(0)
  const router = useRouter();
   const getAllBookings = async () => {
  try {
    let token = localStorage.getItem('token')
   if(!token) return router.replace('/')
    const response = await axios.get(`${BaseURL}/bookings/past/all/users/booking`,
       {  headers: {
                Authorization: `Bearer ${token}`,
              }}
      );
      console.log("your booking history response is :",response);
    const users = response.data;
    console.log(users,' the user data');
    // Only update state if data exists
    if (users && users.users) {
      setBookings(users.users);
      setTotalPages(Math.ceil(users.users.length / itemsPerPage))
    }
  } catch (error) {
    setBookings([]); 
  }
};
useEffect(()=>{
  getAllBookings();
},[])
  const getStatusColor = (status) => {
    switch (status) {
      case "Cancelled":
        return "bg-red-100 text-red-600";
      case "OnGoing":
        return "bg-yellow-100 text-yellow-600";
      case "Completed":
        return "bg-green-100 text-green-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50/50">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Booking History</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-orange-500">Booking History</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <Button variant="outline" size="sm" className="gap-2">
          <Calendar className="h-4 w-4" />
          <span>All</span>
        </Button>

        <Select defaultValue="10">
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="bg-gray-50/80">Order Id</TableHead>
              <TableHead className="bg-gray-50/80">Customer Name</TableHead>
              <TableHead className="bg-gray-50/80">Booking Date</TableHead>
              <TableHead className="bg-gray-50/80">Payment Status</TableHead>
              <TableHead className="bg-gray-50/80">Booking Status</TableHead>
              <TableHead className="bg-gray-50/80">Total</TableHead>
              <TableHead className="bg-gray-50/80">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings && bookings.map((booking) => (
              <TableRow key={booking.orderId}>
                <TableCell className="font-medium">{booking.orderId}</TableCell>
                <TableCell>{booking.customerName}</TableCell>
                <TableCell>{booking.bookingDate}</TableCell>
                <TableCell>{booking.paymentStatus}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={`font-normal ${getStatusColor(
                      booking.bookingStatus
                    )}`}
                  >
                    {booking.bookingStatus}
                  </Badge>
                </TableCell>
                <TableCell>{booking.total}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex items-center justify-center space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          {[...Array(totalPages)].map((_, i) => (
            <Button
              key={i + 1}
              variant={currentPage === i + 1 ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
