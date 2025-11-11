import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
} from '@mui/material';
import { Visibility as VisibilityIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { ExpenseWithStats } from '../types';

interface ExpensesListProps {
  expenses: ExpenseWithStats[];
  onViewHistory: (expenseId: string) => void;
  onDeleteExpense: (expenseId: string) => void;
}

const ExpensesList: React.FC<ExpensesListProps> = ({
  expenses,
  onViewHistory,
  onDeleteExpense,
}) => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<ExpenseWithStats | null>(null);

  const handleDeleteClick = (expense: ExpenseWithStats) => {
    setExpenseToDelete(expense);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (expenseToDelete) {
      onDeleteExpense(expenseToDelete.id);
    }
    setDeleteConfirmOpen(false);
    setExpenseToDelete(null);
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setExpenseToDelete(null);
  };

  const getProgressPercentage = (expense: ExpenseWithStats): number => {
    return (expense.amountPaid / expense.totalAmount) * 100;
  };

  const getProgressColor = (percentage: number): 'success' | 'warning' | 'error' | 'primary' => {
    if (percentage >= 100) return 'success';
    if (percentage >= 75) return 'warning';
    if (percentage >= 50) return 'error';
    return 'primary';
  };

  if (expenses.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '300px',
          textAlign: 'center',
        }}
      >
        <Typography variant="h6" color="text.secondary">
          No expense heads created yet. Click the + button to add one.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
          },
          gap: 2,
        }}
      >
        {expenses.map((expense) => {
          const progressPercentage = getProgressPercentage(expense);
          const progressColor = getProgressColor(progressPercentage);

          return (
            <Box key={expense.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" component="div" gutterBottom>
                        {expense.name}
                      </Typography>
                      <Chip label={expense.category} size="small" color="primary" variant="outlined" />
                    </Box>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => onViewHistory(expense.id)}
                        title="View history"
                        color="primary"
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(expense)}
                        title="Delete expense head"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Total Amount
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        ${expense.totalAmount.toFixed(2)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Amount Paid
                      </Typography>
                      <Typography variant="body2" color="success.main" fontWeight="bold">
                        ${expense.amountPaid.toFixed(2)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        Amount Due
                      </Typography>
                      <Typography variant="body2" color="error.main" fontWeight="bold">
                        ${expense.amountDue.toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>

                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Progress
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {progressPercentage.toFixed(1)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(progressPercentage, 100)}
                      color={progressColor}
                      sx={{ height: 8, borderRadius: 1 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Box>
          );
        })}
      </Box>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteConfirmOpen} onClose={handleCancelDelete}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the expense head "{expenseToDelete?.name}"?
            This will also delete all associated payment entries. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ExpensesList;

