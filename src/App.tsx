import React, { useState, useEffect, useMemo } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Fab,
  Box,
  useMediaQuery,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Receipt as ReceiptIcon,
  FileUpload as FileUploadIcon,
  FileDownload as FileDownloadIcon,
  AccountBalance as AccountBalanceIcon,
} from '@mui/icons-material';
import ExpenseHeadDialog from './components/ExpenseHeadDialog';
import AddExpenseDialog from './components/AddExpenseDialog';
import ExpensesList from './components/ExpensesList';
import ExpenseHistory from './components/ExpenseHistory';
import { ExpenseHead, ExpenseEntry, ExpenseData, ExpenseWithStats } from './types';
import { loadData, saveData, exportDataToJSON, importDataFromJSON } from './utils/storage';

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const isMobile = useMediaQuery('(max-width:600px)');
  
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
        },
      }),
    [prefersDarkMode]
  );

  const [data, setData] = useState<ExpenseData>({ expenseHeads: [], expenseEntries: [] });
  const [expenseHeadDialogOpen, setExpenseHeadDialogOpen] = useState(false);
  const [addExpenseDialogOpen, setAddExpenseDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedExpenseHeadId, setSelectedExpenseHeadId] = useState<string | null>(null);
  const [preSelectedExpenseHeadId, setPreSelectedExpenseHeadId] = useState<string | undefined>(undefined);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [currentView, setCurrentView] = useState<'expenses' | 'add'>('expenses');

  // Load data on mount
  useEffect(() => {
    const loadedData = loadData();
    setData(loadedData);
  }, []);

  // Save data whenever it changes
  useEffect(() => {
    saveData(data);
  }, [data]);

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Expense Head operations
  const handleSaveExpenseHead = (expenseHead: Omit<ExpenseHead, 'id' | 'createdAt'>) => {
    const newExpenseHead: ExpenseHead = {
      ...expenseHead,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setData({
      ...data,
      expenseHeads: [...data.expenseHeads, newExpenseHead],
    });
    showSnackbar('Expense head created successfully');
    
    // If opened from AddExpenseDialog, preselect this expense head
    if (addExpenseDialogOpen) {
      setPreSelectedExpenseHeadId(newExpenseHead.id);
    }
  };

  const handleDeleteExpenseHead = (expenseHeadId: string) => {
    setData({
      expenseHeads: data.expenseHeads.filter((head) => head.id !== expenseHeadId),
      expenseEntries: data.expenseEntries.filter((entry) => entry.expenseHeadId !== expenseHeadId),
    });
    showSnackbar('Expense head deleted successfully');
  };

  // Expense Entry operations
  const handleSaveExpenseEntry = (entry: Omit<ExpenseEntry, 'id' | 'date'>) => {
    const newEntry: ExpenseEntry = {
      ...entry,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };
    setData({
      ...data,
      expenseEntries: [...data.expenseEntries, newEntry],
    });
    showSnackbar('Expense entry added successfully');
  };

  const handleDeleteExpenseEntry = (entryId: string) => {
    setData({
      ...data,
      expenseEntries: data.expenseEntries.filter((entry) => entry.id !== entryId),
    });
    showSnackbar('Entry deleted successfully');
  };

  const handleUpdateExpenseEntry = (entryId: string, newAmount: number) => {
    setData({
      ...data,
      expenseEntries: data.expenseEntries.map((entry) =>
        entry.id === entryId ? { ...entry, amountPaid: newAmount } : entry
      ),
    });
    showSnackbar('Entry updated successfully');
  };

  // Calculate stats
  const getAmountPaid = (expenseHeadId: string): number => {
    return data.expenseEntries
      .filter((entry) => entry.expenseHeadId === expenseHeadId)
      .reduce((sum, entry) => sum + entry.amountPaid, 0);
  };

  const getAmountDue = (expenseHeadId: string): number => {
    const expenseHead = data.expenseHeads.find((head) => head.id === expenseHeadId);
    if (!expenseHead) return 0;
    return expenseHead.totalAmount - getAmountPaid(expenseHeadId);
  };

  const expensesWithStats: ExpenseWithStats[] = data.expenseHeads.map((head) => ({
    ...head,
    amountPaid: getAmountPaid(head.id),
    amountDue: getAmountDue(head.id),
  }));

  // History operations
  const handleViewHistory = (expenseHeadId: string) => {
    setSelectedExpenseHeadId(expenseHeadId);
    setHistoryDialogOpen(true);
  };

  const selectedExpenseHead = data.expenseHeads.find((head) => head.id === selectedExpenseHeadId) || null;
  const historyEntries = data.expenseEntries.filter((entry) => entry.expenseHeadId === selectedExpenseHeadId);

  // Import/Export operations
  const handleExport = () => {
    exportDataToJSON(data);
    showSnackbar('Data exported successfully');
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importDataFromJSON(file)
        .then((importedData) => {
          setData(importedData);
          showSnackbar('Data imported successfully');
        })
        .catch((error) => {
          showSnackbar('Failed to import data: ' + error.message, 'error');
        });
      // Reset the input
      event.target.value = '';
    }
  };

  const handleOpenExpenseHeadDialog = () => {
    setExpenseHeadDialogOpen(true);
  };

  const handleCloseExpenseHeadDialog = () => {
    setExpenseHeadDialogOpen(false);
    setPreSelectedExpenseHeadId(undefined);
  };

  const handleOpenAddExpenseDialog = () => {
    setAddExpenseDialogOpen(true);
    setPreSelectedExpenseHeadId(undefined);
  };

  const handleCloseAddExpenseDialog = () => {
    setAddExpenseDialogOpen(false);
    setPreSelectedExpenseHeadId(undefined);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', pb: isMobile ? 7 : 0 }}>
        <AppBar position="static">
          <Toolbar>
            <AccountBalanceIcon sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Expense Manager
            </Typography>
            
            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Import Data">
                  <IconButton color="inherit" component="label">
                    <FileDownloadIcon />
                    <input
                      type="file"
                      hidden
                      accept="application/json"
                      onChange={handleImport}
                    />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Export Data">
                  <IconButton color="inherit" onClick={handleExport}>
                    <FileUploadIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flex: 1 }}>
          <ExpensesList
            expenses={expensesWithStats}
            onViewHistory={handleViewHistory}
            onDeleteExpense={handleDeleteExpenseHead}
          />
        </Container>

        {/* Desktop FABs */}
        {!isMobile && (
          <>
            <Fab
              color="primary"
              aria-label="add expense head"
              sx={{ position: 'fixed', bottom: 80, right: 16 }}
              onClick={handleOpenExpenseHeadDialog}
            >
              <AccountBalanceIcon />
            </Fab>
            <Fab
              color="secondary"
              aria-label="add expense"
              sx={{ position: 'fixed', bottom: 16, right: 16 }}
              onClick={handleOpenAddExpenseDialog}
            >
              <AddIcon />
            </Fab>
          </>
        )}

        {/* Mobile Bottom Navigation */}
        {isMobile && (
          <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
            <BottomNavigation
              showLabels
              value={currentView}
              onChange={(_, newValue) => {
                setCurrentView(newValue);
                if (newValue === 'add') {
                  handleOpenAddExpenseDialog();
                  // Reset back to expenses view
                  setTimeout(() => setCurrentView('expenses'), 100);
                }
              }}
            >
              <BottomNavigationAction label="Expenses" value="expenses" icon={<ReceiptIcon />} />
              <BottomNavigationAction label="Add Entry" value="add" icon={<AddIcon />} />
              <BottomNavigationAction
                label="Import"
                value="import"
                icon={
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <FileDownloadIcon />
                    <input
                      type="file"
                      hidden
                      accept="application/json"
                      onChange={handleImport}
                    />
                  </label>
                }
              />
              <BottomNavigationAction
                label="Export"
                value="export"
                icon={<FileUploadIcon />}
                onClick={handleExport}
              />
            </BottomNavigation>
          </Paper>
        )}

        {/* Mobile FAB for adding expense head */}
        {isMobile && (
          <Fab
            color="primary"
            aria-label="add expense head"
            sx={{ position: 'fixed', bottom: 80, right: 16 }}
            onClick={handleOpenExpenseHeadDialog}
          >
            <AccountBalanceIcon />
          </Fab>
        )}

        {/* Dialogs */}
        <ExpenseHeadDialog
          open={expenseHeadDialogOpen}
          onClose={handleCloseExpenseHeadDialog}
          onSave={handleSaveExpenseHead}
        />

        <AddExpenseDialog
          open={addExpenseDialogOpen}
          onClose={handleCloseAddExpenseDialog}
          expenseHeads={data.expenseHeads}
          onSave={handleSaveExpenseEntry}
          onAddExpenseHead={handleOpenExpenseHeadDialog}
          getAmountDue={getAmountDue}
          preSelectedExpenseHeadId={preSelectedExpenseHeadId}
        />

        <ExpenseHistory
          open={historyDialogOpen}
          onClose={() => setHistoryDialogOpen(false)}
          expenseHead={selectedExpenseHead}
          entries={historyEntries}
          onDeleteEntry={handleDeleteExpenseEntry}
          onUpdateEntry={handleUpdateExpenseEntry}
        />

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

export default App;
