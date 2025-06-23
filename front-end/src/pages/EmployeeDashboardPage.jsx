import React from 'react';
import { Box, Typography, Card, Avatar, Button } from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import { useAuth } from '../context/AuthContext';

const EmployeeDashboardPage = () => {
  const { user } = useAuth();

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Welcome, {user?.name || 'Employee'}!
      </Typography>
      <Card elevation={2} sx={{ display: 'flex', alignItems: 'center', p: 3, mb: 4, maxWidth: 400 }}>
        <Avatar sx={{ width: 64, height: 64, fontSize: 32, mr: 3 }}>
          {user?.name?.charAt(0).toUpperCase() || 'E'}
        </Avatar>
        <Box>
          <Typography variant="h6">{user?.name}</Typography>
          <Typography color="text.secondary">{user?.email}</Typography>
          <Typography color="text.secondary">Role: {user?.role}</Typography>
        </Box>
      </Card>
      <Box sx={{ mt: 6, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<QrCodeScannerIcon fontSize="large" />}
          sx={{ px: 6, py: 3, fontSize: 20, borderRadius: 3 }}
          disabled
        >
          Quét mã QR vé
        </Button>
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          (Chức năng quét mã QR sẽ sớm có mặt)
        </Typography>
      </Box>
    </Box>
  );
};

export default EmployeeDashboardPage; 