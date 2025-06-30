import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Box } from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

const ConfirmDialog = ({ open, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel" }) => {
  return (
      <Dialog
          open={open}
          onClose={onClose}
          aria-labelledby="confirm-dialog-title"
          aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title" sx={{ display: 'flex', alignItems: 'center' }}>
          <WarningAmberRoundedIcon color="warning" sx={{ mr: 1.5 }} />
          {title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">
            {message}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: '16px 24px' }}>
          <Button onClick={onClose} color="inherit">
            {cancelText}
          </Button>
          <Button onClick={onConfirm} color="error" variant="contained" autoFocus>
            {confirmText}
          </Button>
        </DialogActions>
      </Dialog>
  );
};

export default ConfirmDialog;