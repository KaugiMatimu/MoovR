"use client"

import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell } from "@nextui-org/table"
import { Button } from "@nextui-org/button"
import { Card, CardBody } from "@nextui-org/card"
import { Chip } from "@nextui-org/chip"

export default function PayoutsPage() {
  const payouts = [
    {
      id: "PAY001",
      driverName: "Vikas",
      amount: 7076.64,
      requestDate: "2025-02-05",
      status: "pending",
    },
    {
      id: "PAY002",
      driverName: "Taxi Alex",
      amount: 4684.47,
      requestDate: "2025-02-04",
      status: "completed",
    },
    // Add more payout requests
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Payout Requests</h1>
      </div>

      <Card>
        <CardBody>
          <Table aria-label="Payout requests table">
            <TableHeader>
              <TableColumn>REQUEST ID</TableColumn>
              <TableColumn>DRIVER NAME</TableColumn>
              <TableColumn>AMOUNT</TableColumn>
              <TableColumn>REQUEST DATE</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>ACTION</TableColumn>
            </TableHeader>
            <TableBody>
              {payouts.map((payout) => (
                <TableRow key={payout.id}>
                  <TableCell>{payout.id}</TableCell>
                  <TableCell>{payout.driverName}</TableCell>
                  <TableCell>${payout.amount}</TableCell>
                  <TableCell>{payout.requestDate}</TableCell>
                  <TableCell>
                    <Chip color={payout.status === "completed" ? "success" : "warning"} variant="flat">
                      {payout.status}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    {payout.status === "pending" && (
                      <Button size="sm" color="primary">
                        Approve
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  )
}

