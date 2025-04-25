
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { Users, TrendingUp, ShoppingBag, ArrowUpCircle } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import MetricCard from '@/components/common/MetricCard';
import DataTable from '@/components/common/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  getTopProfitCustomers, 
  getTopDebtCustomers,
  getTopSellingProducts,
  getRecentSales,
  getSalesPurchaseData
} from '@/services/mockData';

const Home = () => {
  const topProfitCustomers = getTopProfitCustomers(5);
  const topDebtCustomers = getTopDebtCustomers(5);
  const topProducts = getTopSellingProducts(5);
  const recentSales = getRecentSales(20);
  const chartData = getSalesPurchaseData();

  // Summary data
  const totalSales = recentSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalReceived = recentSales.reduce((sum, sale) => sum + sale.amountPaid, 0);
  const totalBalance = totalSales - totalReceived;
  const totalProfit = topProducts.reduce((sum, product) => sum + product.profit, 0);

  // Columns for tables
  const customerColumns = [
    { header: 'Customer', accessorKey: 'customerName' },
    { 
      header: 'Total Sales', 
      accessorKey: 'totalSales',
      cell: (row) => `₹${row.totalSales.toLocaleString()}`
    },
    { 
      header: 'Amount Received', 
      accessorKey: 'amountReceived',
      cell: (row) => `₹${row.amountReceived.toLocaleString()}`
    },
    { 
      header: 'Balance', 
      accessorKey: 'amountBalance',
      cell: (row) => `₹${row.amountBalance.toLocaleString()}`
    },
    { 
      header: 'Profit', 
      accessorKey: 'profit',
      cell: (row) => `₹${row.profit.toLocaleString()}`
    }
  ];

  const productColumns = [
    { header: 'Product', accessorKey: 'productName' },
    { 
      header: 'Total Sales', 
      accessorKey: 'totalSales',
      cell: (row) => `₹${row.totalSales.toLocaleString()}`
    },
    { 
      header: 'Quantity Sold', 
      accessorKey: 'totalQuantity' 
    },
    { 
      header: 'Profit', 
      accessorKey: 'profit',
      cell: (row) => `₹${row.profit.toLocaleString()}`
    }
  ];

  const recentSalesColumns = [
    { header: 'Invoice #', accessorKey: 'salesId' },
    { header: 'Date', accessorKey: 'date' },
    { header: 'Customer', accessorKey: 'customerName' },
    { 
      header: 'Amount', 
      accessorKey: 'totalAmount',
      cell: (row) => `₹${row.totalAmount.toLocaleString()}`
    },
    { 
      header: 'Paid', 
      accessorKey: 'amountPaid',
      cell: (row) => `₹${row.amountPaid.toLocaleString()}`
    },
    { 
      header: 'Balance', 
      accessorKey: (row) => `₹${(row.totalAmount - row.amountPaid).toLocaleString()}`
    },
    { 
      header: 'Status', 
      accessorKey: (row) => {
        const isPaid = row.totalAmount <= row.amountPaid;
        return (
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {isPaid ? 'Paid' : 'Partial'}
          </span>
        );
      }
    }
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
              columns={customerColumns}
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
            columns={recentSalesColumns}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Home;
