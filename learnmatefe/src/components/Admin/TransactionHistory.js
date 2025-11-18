import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Row,
  Col,
  Button,
  Tag,
  Space,
  Input,
  Select,
  DatePicker,
  Typography,
  Avatar,
  Tooltip,
  Badge,
  Statistic,
  Progress
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  HistoryOutlined,
  UserOutlined,
  DownloadOutlined,
  FilterOutlined,
  ArrowLeftOutlined,
  DollarOutlined,
  TransactionOutlined,
  RiseOutlined,
  FallOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import AdminService from '../../Service/ApiService/AdminService';
import './TransactionHistory.scss';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

const TransactionHistory = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]); // Tất cả transactions cho statistics
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // Filter states
  const [filters, setFilters] = useState({
    type: 'all',
    search: '',
    dateRange: null
  });

  // Calculate statistics
  const statistics = {
    totalTransactions: allTransactions.length,
    totalValue: allTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0),
    totalIncome: allTransactions.filter(t => ['topup', 'earning', 'refund'].includes(t.type)).reduce((sum, t) => sum + t.amount, 0),
    totalOutcome: allTransactions.filter(t => ['withdraw', 'spend'].includes(t.type)).reduce((sum, t) => sum + t.amount, 0),
    successRate: allTransactions.length > 0 ? (allTransactions.filter(t => t.status === 'success').length / allTransactions.length * 100) : 0
  };

  useEffect(() => {
    fetchTransactions();
    fetchAllTransactions(); // Fetch all transactions for statistics
  }, [pagination.current, pagination.pageSize, filters]);

  useEffect(() => {
    fetchAllTransactions(); // Fetch all transactions when component mounts
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        type: filters.type !== 'all' ? filters.type : undefined,
        userId: filters.userId || undefined,
        startDate: filters.dateRange?.[0]?.format('YYYY-MM-DD'),
        endDate: filters.dateRange?.[1]?.format('YYYY-MM-DD')
      };

      const response = await AdminService.getTransactionHistory(params);
      if (response && response.success) {
        setTransactions(response.data);
        setPagination(prev => ({
          ...prev,
          total: response.pagination.totalItems
        }));
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTransactions = async () => {
    try {
      // Fetch all transactions without filtering for statistics
      const params = {
        page: 1,
        limit: 10000, // Large number to get all transactions
        // No type filter - get all types
        userId: filters.userId || undefined,
        startDate: filters.dateRange?.[0]?.format('YYYY-MM-DD'),
        endDate: filters.dateRange?.[1]?.format('YYYY-MM-DD')
      };

      const response = await AdminService.getTransactionHistory(params);
      if (response && response.success) {
        setAllTransactions(response.data);
      }
    } catch (error) {
      console.error('Error fetching all transactions:', error);
    }
  };

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  const getTypeColor = (type) => {
    const colors = {
      topup: 'green',     // Nạp tiền - tăng số dư
      withdraw: 'red',    // Rút tiền - giảm số dư
      earning: 'blue',    // Thu nhập thực sự (gia sư nhận tiền từ học viên)
      spend: 'orange',    // Chi tiêu (học viên trả tiền cho gia sư)
      refund: 'cyan'      // Hoàn tiền - tăng số dư (không phải thu nhập)
    };
    return colors[type] || 'default';
  };

  const getTypeText = (type) => {
    const texts = {
      topup: 'Nạp tiền',
      withdraw: 'Rút tiền',
      earning: 'Thu nhập',
      spend: 'Chi tiêu',
      refund: 'Hoàn tiền'
    };
    return texts[type] || type;
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'topup': return '⬆️';   // Nạp tiền lên
      case 'withdraw': return '⬇️'; // Rút tiền xuống
      case 'earning': return '💰';  // Thu nhập (tiền túi)
      case 'spend': return '💳';    // Chi tiêu (thẻ tín dụng)
      case 'refund': return '↩️';   // Hoàn trả (mũi tên quay lại)
      default: return '💵';
    }
  };

  const getTransactionTypeDescription = (type) => {
    const descriptions = {
      topup: 'Nạp tiền từ bên ngoài vào hệ thống',
      withdraw: 'Rút tiền từ hệ thống ra tài khoản ngân hàng',
      earning: 'Thu nhập từ việc dạy học (gia sư nhận tiền)',
      spend: 'Chi tiêu cho việc học (học viên trả tiền)',
      refund: 'Hoàn trả tiền đã có trong hệ thống'
    };
    return descriptions[type] || '';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const columns = [
    {
      title: 'Người dùng',
      key: 'user',
      width: 200,
      render: (_, record) => (
        <Space>
          <Avatar 
            src={record.userId?.image} 
            icon={<UserOutlined />}
            size="small"
          />
          <div>
            <div style={{ fontWeight: 500 }}>{record.userId?.username}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.userId?.email}
            </Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Loại giao dịch',
      dataIndex: 'type',
      key: 'type',
      width: 150,
      render: (type) => (
        <Tag color={getTypeColor(type)}>
          {getTypeIcon(type)} {getTypeText(type)}
        </Tag>
      )
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      render: (amount, record) => (
        <Text 
          strong 
          style={{ 
            color: record.balanceChange > 0 ? '#52c41a' : '#f5222d'
          }}
        >
          {record.balanceChange > 0 ? '+' : ''}{formatCurrency(amount)}
        </Text>
      )
    },
    {
      title: 'Thay đổi số dư',
      dataIndex: 'balanceChange',
      key: 'balanceChange',
      width: 150,
      render: (balanceChange) => (
        <Text 
          strong 
          style={{ 
            color: balanceChange > 0 ? '#52c41a' : '#f5222d'
          }}
        >
          {balanceChange > 0 ? '+' : ''}{formatCurrency(balanceChange)}
        </Text>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const statusConfig = {
          success: { color: 'green', text: 'Thành công' },
          pending: { color: 'orange', text: 'Chờ xử lý' },
          failed: { color: 'red', text: 'Thất bại' }
        };
        const config = statusConfig[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (description, record) => (
        <div>
          <Tooltip title={description}>
            <Text>{description}</Text>
          </Tooltip>
          <br />
          <Text type="secondary" style={{ fontSize: '11px', fontStyle: 'italic' }}>
            {getTransactionTypeDescription(record.type)}
          </Text>
        </div>
      )
    },
    {
      title: 'Ngày giao dịch',
      dataIndex: 'date',
      key: 'date',
      width: 180,
      render: (date) => (
        <div>
          <div>{new Date(date).toLocaleDateString('vi-VN')}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {new Date(date).toLocaleTimeString('vi-VN')}
          </Text>
        </div>
      )
    }
  ];

  return (
    <div className="transaction-history">
      {/* Modern Dashboard Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="welcome-section">
    
            <Title level={1} className="welcome-title">
              <TransactionOutlined />
              Lịch sử Giao dịch
            </Title>
            <Text className="welcome-subtitle">
              Quản lý và theo dõi tất cả giao dịch tài chính trong hệ thống
            </Text>
          </div>
          <div className="header-stats">
            <Badge count={statistics.totalTransactions} showZero>
              <Avatar size={50} icon={<HistoryOutlined />} />
            </Badge>
            <div className="current-date">
              <CalendarOutlined />
              {new Date().toLocaleDateString('vi-VN')}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Metrics Section */}
      <div className="metrics-section">
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={6}>
            <Card className="metric-card primary">
              <div className="metric-content">
                <div className="metric-icon primary">
                  <TransactionOutlined />
                </div>
                <div className="metric-details">
                  <Statistic
                    value={statistics.totalTransactions}
                    valueStyle={{ fontSize: '28px', fontWeight: 'bold', color: '#1890ff' }}
                  />
                  <Text className="metric-title">Tổng giao dịch</Text>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="metric-card warning">
              <div className="metric-content">
                <div className="metric-icon warning">
                  <DollarOutlined />
                </div>
                <div className="metric-details">
                  <Statistic
                    value={statistics.totalValue}
                    formatter={(value) => formatCurrency(value)}
                    valueStyle={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}
                  />
                  <Text className="metric-title">Tổng giá trị</Text>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="metric-card success">
              <div className="metric-content">
                <div className="metric-icon success">
                  <RiseOutlined />
                </div>
                <div className="metric-details">
                  <Statistic
                    value={statistics.totalIncome}
                    formatter={(value) => formatCurrency(value)}
                    valueStyle={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}
                  />
                  <Text className="metric-title">Thu nhập</Text>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="metric-card danger">
              <div className="metric-content">
                <div className="metric-icon danger">
                  <FallOutlined />
                </div>
                <div className="metric-details">
                  <Statistic
                    value={statistics.totalOutcome}
                    formatter={(value) => formatCurrency(value)}
                    valueStyle={{ fontSize: '24px', fontWeight: 'bold', color: '#ff4d4f' }}
                  />
                  <Text className="metric-title">Chi tiêu</Text>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Modern Filters Section */}
      <Card className="filter-card">
        <Row gutter={[24, 16]} align="middle">
          <Col xs={24} sm={8} md={6}>
            <div className="filter-group">
            <Text strong>Tìm kiếm:</Text>
              <Input
                className="filter-select"
                placeholder="Tìm theo tên, email..."
                prefix={<SearchOutlined />}
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                allowClear
              />
            </div>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <div className="filter-group">
              <Text strong>Loại giao dịch:</Text>
              <Select
                className="filter-select"
                placeholder="Chọn loại giao dịch"
                value={filters.type}
                onChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
              >
                <Option value="all">Tất cả loại</Option>
                <Option value="topup">Nạp tiền</Option>
                <Option value="withdraw">Rút tiền</Option>
                <Option value="earning">Thu nhập</Option>
                <Option value="spend">Chi tiêu</Option>
                <Option value="refund">Hoàn tiền</Option>
              </Select>
            </div>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <div className="filter-group">
              <Text strong>Khoảng thời gian:</Text>
              <RangePicker
                className="filter-select"
                placeholder={['Từ ngày', 'Đến ngày']}
                value={filters.dateRange}
                onChange={(dates) => setFilters(prev => ({ ...prev, dateRange: dates }))}
              />
            </div>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <div className="filter-group filter-actions">
              <Text strong>&nbsp;</Text>
              <div className="filter-actions__buttons">
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  onClick={fetchTransactions}
                  loading={loading}
                >
                  Tìm kiếm
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    setFilters({
                      status: 'all',
                      targetType: 'all',
                      dateRange: null
                    });
                    fetchTransactions();
                  }}
                >
                  Làm mới
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Transaction Type Details */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={12} md={6} lg={6}>
          <Card className="transaction-detail-card topup">
            <div className="transaction-detail">
              <div className="transaction-icon">⬆️</div>
              <div className="transaction-info">
                <div className="transaction-type">Nạp tiền</div>
                <div className="transaction-count">
                  {allTransactions.filter(t => t.type === 'topup').length} giao dịch
                </div>
                <div className="transaction-amount">
                  {formatCurrency(
                    allTransactions
                      .filter(t => t.type === 'topup')
                      .reduce((sum, t) => sum + t.amount, 0)
                  )}
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6}>
          <Card className="transaction-detail-card withdraw">
            <div className="transaction-detail">
              <div className="transaction-icon">⬇️</div>
              <div className="transaction-info">
                <div className="transaction-type">Rút tiền</div>
                <div className="transaction-count">
                  {allTransactions.filter(t => t.type === 'withdraw').length} giao dịch
                </div>
                <div className="transaction-amount">
                  {formatCurrency(
                    allTransactions
                      .filter(t => t.type === 'withdraw')
                      .reduce((sum, t) => sum + t.amount, 0)
                  )}
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6}>
          <Card className="transaction-detail-card earning">
            <div className="transaction-detail">
              <div className="transaction-icon">💰</div>
              <div className="transaction-info">
                <div className="transaction-type">Thu nhập</div>
                <div className="transaction-count">
                  {allTransactions.filter(t => t.type === 'earning').length} giao dịch
                </div>
                <div className="transaction-amount">
                  {formatCurrency(
                    allTransactions
                      .filter(t => t.type === 'earning')
                      .reduce((sum, t) => sum + t.amount, 0)
                  )}
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6}>
          <Card className="transaction-detail-card spend">
            <div className="transaction-detail">
              <div className="transaction-icon">💳</div>
              <div className="transaction-info">
                <div className="transaction-type">Chi tiêu</div>
                <div className="transaction-count">
                  {allTransactions.filter(t => t.type === 'spend').length} giao dịch
                </div>
                <div className="transaction-amount">
                  {formatCurrency(
                    allTransactions
                      .filter(t => t.type === 'spend')
                      .reduce((sum, t) => sum + t.amount, 0)
                  )}
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>


      {/* Transactions Table */}
      <Card className="table-card">
        <Table
          columns={columns}
          dataSource={transactions}
          rowKey="_id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} giao dịch`
          }}
          onChange={handleTableChange}
          scroll={{ x: 1400 }}
        />
      </Card>

      {/* Success Rate Card */}
      <Card style={{ marginTop: 24 }}>
        <Title level={4}>Thống kê tỷ lệ thành công</Title>
        <Progress 
          percent={statistics.successRate} 
          strokeColor={{
            '0%': '#108ee9',
            '100%': '#87d068',
          }}
          format={(percent) => `${percent?.toFixed(1)}%`}
        />
        <Text type="secondary">
          {allTransactions.filter(t => t.status === 'success').length} / {allTransactions.length} giao dịch thành công
        </Text>
      </Card>
    </div>
  );
};

export default TransactionHistory;