
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { LineChart, Line, Legend, BarChart, Bar } from 'recharts';
import MetricCard from '@/components/common/MetricCard';
import DataTable from '@/components/common/DataTable';
import TabsContainer from '@/components/common/TabsContent';
import { ShoppingBag, ArrowUpCircle, Users, TrendingUp } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import {
  getTopProfitCustomers,
  getTopDebtCustomers,
  getTopSellingProducts,
  getRecentSales,
  getSalesPurchaseData,
  Customer,
} from '@/services/mockData';

const Home = () => {
  // Get the relevant data
  const topProfitCustomers = getTopProfitCustomers();
  const topDebtCustomers = getTopDebtCustomers();
  const topProducts = getTopSellingProducts();
  const recentSales = getRecentSales();
  const chartData = getSalesPurchaseData();

  // Calculate total metrics from top customers
  const totalProfit = topProfitCustomers.reduce((sum, customer) => sum + customer.profit, 0);
  const totalSales = topProfitCustomers.reduce((sum, customer) => sum + customer.totalSales, 0);
  const totalBalance = topDebtCustomers.reduce((sum, customer) => sum + customer.amountBalance, 0);
  const totalReceived = topProfitCustomers.reduce((sum, customer) => sum + customer.amountReceived, 0);

  // Define columns for tables
  const customerColumns = [
    { 
      header: 'Customer Name',
      accessorKey: (row: Customer) => row.customerName
    },
    { 
      header: 'Profit',
      accessorKey: (row: Customer) => `₹${row.profit.toLocaleString()}`
    },
    { 
      header: 'Total Sales',
      accessorKey: (row: Customer) => `₹${row.totalSales.toLocaleString()}`
    },
    { 
      header: 'Received',
      accessorKey: (row: Customer) => `₹${row.amountReceived.toLocaleString()}`
    },
    { 
      header: 'Balance',
      accessorKey: (row: Customer) => `₹${row.amountBalance.toLocaleString()}`
    },
  ];

  const debtColumns = [
    { 
      header: 'Customer Name',
      accessorKey: (row: Customer) => row.customerName
    },
    { 
      header: 'Balance',
      accessorKey: (row: Customer) => `₹${row.amountBalance.toLocaleString()}`
    },
    { 
      header: 'Total Sales',
      accessorKey: (row: Customer) => `₹${row.totalSales.toLocaleString()}`
    },
    { 
      header: 'Received',
      accessorKey: (row: Customer) => `₹${row.amountReceived.toLocaleString()}`
    },
    { 
      header: 'Profit',
      accessorKey: (row: Customer) => `₹${row.profit.toLocaleString()}`
    },
  ];

  const productColumns = [
    { 
      header: 'Product Name',
      accessorKey: (row: any) => row.productName
    },
    { 
      header: 'Profit',
      accessorKey: (row: any) => `₹${row.profit.toLocaleString()}`
    },
    { 
      header: 'Total Sales',
      accessorKey: (row: any) => `₹${row.totalSales.toLocaleString()}`
    },
    { 
      header: 'Quantity',
      accessorKey: (row: any) => row.totalQuantity.toString()
    },
  ];

  const salesColumns = [
    { 
      header: 'ID',
      accessorKey: (row: any) => row.salesId
    },
    { 
      header: 'Date',
      accessorKey: (row: any) => row.date
    },
    { 
      header: 'Customer',
      accessorKey: (row: any) => row.customerName
    },
    { 
      header: 'Products',
      accessorKey: (row: any) => row.products.length.toString()
    },
    { 
      header: 'Total',
      accessorKey: (row: any) => `₹${row.totalAmount.toLocaleString()}`
    },
    { 
      header: 'Amount Paid',
      accessorKey: (row: any) => `₹${row.amountPaid.toLocaleString()}`
    },
  ];

  return (
    <div>
      <PageHeader 
        title="Dashboard" 
        subtitle="Overview of your business performance"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <MetricCard 
          title="Total Sales"
          value={`₹${totalSales.toLocaleString()}`}
          icon={ShoppingBag}
          change={{ value: 12, isPositive: true }}
          iconColor="text-blue-600"
        />
        <MetricCard 
          title="Total Received"
          value={`₹${totalReceived.toLocaleString()}`}
          icon={ArrowUpCircle}
          change={{ value: 8, isPositive: true }}
          iconColor="text-green-600"
        />
        <MetricCard 
          title="Total Balance"
          value={`₹${totalBalance.toLocaleString()}`}
          icon={Users}
          change={{ value: 5, isPositive: false }}
          iconColor="text-amber-600"
        />
        <MetricCard 
          title="Total Profit"
          value={`₹${totalProfit.toLocaleString()}`}
          icon={TrendingUp}
          change={{ value: 15, isPositive: true }}
          iconColor="text-purple-600"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales & Purchase Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" fill="#3b82f6" name="Sales" />
                <Bar dataKey="purchases" fill="#64748b" name="Purchase" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profit Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="profit" stroke="#10b981" name="Profit" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Customers and Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Profit Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable 
              data={topProfitCustomers} 
              columns={customerColumns}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Debt Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable 
              data={topDebtCustomers} 
              columns={debtColumns}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable 
              data={topProducts} 
              columns={productColumns}
            />
          </CardContent>
        </Card>
      </div>

      {/* Recent Sales */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sales Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable 
            data={recentSales} 
            columns={salesColumns}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Home;
