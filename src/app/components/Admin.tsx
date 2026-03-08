import { DashboardLayout } from "./DashboardLayout";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { toast } from "sonner";

const mockMerchants = [
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Demo Store",
    email: "merchant@store.com",
    stellarAddress: "GCXX...XX12",
    isActive: true,
    totalVolume: "12,430.25",
    paymentCount: 45,
  },
  {
    id: "660e9500-f30c-52e5-b827-557766551111",
    name: "Tech Shop",
    email: "tech@shop.com",
    stellarAddress: "GDYY...YY34",
    isActive: true,
    totalVolume: "8,250.50",
    paymentCount: 32,
  },
  {
    id: "770f0600-g41d-63f6-c938-668877662222",
    name: "Fashion Hub",
    email: "fashion@hub.com",
    stellarAddress: "GEZZ...ZZ56",
    isActive: false,
    totalVolume: "5,100.00",
    paymentCount: 18,
  },
  {
    id: "880g1700-h52e-74g7-d049-779988773333",
    name: "Food Mart",
    email: "food@mart.com",
    stellarAddress: "GFAA...AA78",
    isActive: true,
    totalVolume: "15,890.75",
    paymentCount: 67,
  },
];

export function Admin() {
  const handleToggleStatus = (merchantId: string, currentStatus: boolean) => {
    toast.success(
      `Merchant ${currentStatus ? "disabled" : "enabled"} successfully!`
    );
  };

  return (
    <DashboardLayout activePage="merchants" isAdmin>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage merchants and monitor platform activity
          </p>
        </div>

        {/* Platform Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="p-6 bg-card border-border">
            <div className="text-2xl mb-1">4</div>
            <p className="text-sm text-muted-foreground">Total Merchants</p>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="text-2xl mb-1">3</div>
            <p className="text-sm text-muted-foreground">Active Merchants</p>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="text-2xl mb-1">$41,671.50</div>
            <p className="text-sm text-muted-foreground">Platform Volume (USDC)</p>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="text-2xl mb-1">162</div>
            <p className="text-sm text-muted-foreground">Total Payments</p>
          </Card>
        </div>

        {/* Merchants Table */}
        <Card className="bg-card border-border">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl">All Merchants</h2>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Merchant Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Stellar Address</TableHead>
                  <TableHead>Total Volume</TableHead>
                  <TableHead>Payments</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockMerchants.map((merchant) => (
                  <TableRow key={merchant.id}>
                    <TableCell>{merchant.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {merchant.email}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {merchant.stellarAddress}
                    </TableCell>
                    <TableCell>${merchant.totalVolume}</TableCell>
                    <TableCell>{merchant.paymentCount}</TableCell>
                    <TableCell>
                      <Badge
                        variant={merchant.isActive ? "default" : "secondary"}
                        className={
                          merchant.isActive
                            ? "bg-primary/20 text-primary border-primary/30"
                            : ""
                        }
                      >
                        {merchant.isActive ? "Active" : "Disabled"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={merchant.isActive}
                        onCheckedChange={() =>
                          handleToggleStatus(merchant.id, merchant.isActive)
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-card border-border">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl">Recent Activity</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-4 pb-4 border-b border-border">
              <div className="w-2 h-2 bg-primary rounded-full mt-2" />
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-medium">Demo Store</span> received payment
                  of <span className="text-primary">$150.00 USDC</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  2 minutes ago
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 pb-4 border-b border-border">
              <div className="w-2 h-2 bg-primary rounded-full mt-2" />
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-medium">Food Mart</span> created new
                  payment session
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  15 minutes ago
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 pb-4 border-b border-border">
              <div className="w-2 h-2 bg-primary rounded-full mt-2" />
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-medium">Fashion Hub</span> was disabled
                  by admin
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  1 hour ago
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-2 h-2 bg-primary rounded-full mt-2" />
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-medium">Tech Shop</span> received payment
                  of <span className="text-primary">$89.99 USDC</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  2 hours ago
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
