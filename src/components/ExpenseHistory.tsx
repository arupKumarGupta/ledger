import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Box,
  Typography,
  TextField,
  Divider,
  Button,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  Edit as EditIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { ExpenseHead, ExpenseEntry } from '../types';

interface ExpenseHistoryProps {
  open: boolean;
  onClose: () => void;
  expenseHead: ExpenseHead | null;
  entries: ExpenseEntry[];
  onDeleteEntry: (entryId: string) => void;
  onUpdateEntry: (entryId: string, newAmount: number) => void;
}

const ExpenseHistory: React.FC<ExpenseHistoryProps> = ({
  open,
  onClose,
  expenseHead,
  entries,
  onDeleteEntry,
  onUpdateEntry,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<string>('');
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  const handleEditClick = (entry: ExpenseEntry) => {
    setEditingId(entry.id);
    setEditAmount(entry.amountPaid.toString());
  };

  const handleSaveEdit = (entryId: string) => {
    const amount = parseFloat(editAmount);
    if (!isNaN(amount) && amount > 0) {
      onUpdateEntry(entryId, amount);
      setEditingId(null);
      setEditAmount('');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditAmount('');
  };

  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {expenseHead?.name} - Payment History
            </Typography>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {expenseHead && (
            <Box sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Category:</strong> {expenseHead.category}
              </Typography>
              <Typography variant="body2">
                <strong>Total Amount:</strong> ${expenseHead.totalAmount.toFixed(2)}
              </Typography>
            </Box>
          )}

          {sortedEntries.length === 0 ? (
            <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
              No payment entries yet
            </Typography>
          ) : (
            <List>
              {sortedEntries.map((entry, index) => (
                <React.Fragment key={entry.id}>
                  {index > 0 && <Divider />}
                  <ListItem
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'stretch',
                      py: 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(entry.date)}
                      </Typography>
                      <Box>
                        {entry.image && (
                          <IconButton
                            size="small"
                            onClick={() => setViewingImage(entry.image!)}
                            title="View image"
                          >
                            <ImageIcon fontSize="small" />
                          </IconButton>
                        )}
                        <IconButton
                          size="small"
                          onClick={() => handleEditClick(entry)}
                          disabled={editingId === entry.id}
                          title="Edit amount"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => onDeleteEntry(entry.id)}
                          title="Delete entry"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    
                    {editingId === entry.id ? (
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <TextField
                          type="number"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          size="small"
                          inputProps={{ step: '0.01', min: '0' }}
                          autoFocus
                          fullWidth
                        />
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleSaveEdit(entry.id)}
                        >
                          <CheckIcon />
                        </IconButton>
                        <IconButton size="small" onClick={handleCancelEdit}>
                          <CloseIcon />
                        </IconButton>
                      </Box>
                    ) : (
                      <Typography variant="h6" color="primary">
                        ${entry.amountPaid.toFixed(2)}
                      </Typography>
                    )}
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>

      {/* Image viewing dialog */}
      <Dialog
        open={!!viewingImage}
        onClose={() => setViewingImage(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Receipt Image</Typography>
            <IconButton onClick={() => setViewingImage(null)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {viewingImage && (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <img
                src={viewingImage}
                alt="Receipt"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExpenseHistory;

