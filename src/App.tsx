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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  SpeedDial,
  SpeedDialAction,
} from '@mui/material';
import {
  Add as AddIcon,
  Receipt as ReceiptIcon,
  FileUpload as FileUploadIcon,
  FileDownload as FileDownloadIcon,
  AccountBalance as AccountBalanceIcon,
  Event as EventIcon,
  Cloud as CloudIcon,
  CloudOff as CloudOffIcon,
  Sync as SyncIcon,
  DeleteForever as DeleteForeverIcon,
  Category as CategoryIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import ExpenseHeadDialog from './components/ExpenseHeadDialog';
import AddExpenseDialog from './components/AddExpenseDialog';
import EventDialog from './components/EventDialog';
import EventsList from './components/EventsList';
import ExpenseHistory from './components/ExpenseHistory';
import { Event, ExpenseHead, ExpenseEntry, ExpenseData, ExpenseWithStats, EventWithStats } from './types';
import { exportDataToJSON, importDataFromJSON, mergeImportedData } from './utils/storage';
import { saveDataWithSync, loadDataWithSync, getSyncStatus, syncToCloud, initSyncStatus } from './utils/cloudSync';
import { clearAllCloudData } from './services/dynamodb';

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

  const [data, setData] = useState<ExpenseData>({ events: [], expenseHeads: [], expenseEntries: [] });
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [expenseHeadDialogOpen, setExpenseHeadDialogOpen] = useState(false);
  const [addExpenseDialogOpen, setAddExpenseDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedExpenseHeadId, setSelectedExpenseHeadId] = useState<string | null>(null);
  const [preSelectedExpenseHeadId, setPreSelectedExpenseHeadId] = useState<string | undefined>(undefined);
  const [preSelectedEventId, setPreSelectedEventId] = useState<string | undefined>(undefined);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [currentView, setCurrentView] = useState<'expenses' | 'add'>('expenses');
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [clearDataDialogOpen, setClearDataDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);

  // Initialize and load data on mount
  useEffect(() => {
    const initData = async () => {
      setIsInitialLoading(true);
      await initSyncStatus();
      const syncStatus = getSyncStatus();
      setCloudSyncEnabled(syncStatus.enabled);
      
      if (!syncStatus.enabled) {
        setIsInitialLoading(false);
        showSnackbar('⚠️ Cloud sync not configured! Please set up AWS Cognito.', 'error');
        setData({ events: [], expenseHeads: [], expenseEntries: [] });
        return;
      }
      
      try {
        const loadedData = await loadDataWithSync();
        setData(loadedData);
        
        if (syncStatus.lastSync) {
          const lastSyncDate = new Date(syncStatus.lastSync).toLocaleString();
          showSnackbar(`✅ Connected to DynamoDB (last sync: ${lastSyncDate})`, 'success');
        } else {
          showSnackbar('✅ Connected to DynamoDB (no previous data)', 'success');
        }
      } catch (error: any) {
        showSnackbar(`❌ Failed to load from DynamoDB: ${error.message}`, 'error');
        setData({ events: [], expenseHeads: [], expenseEntries: [] });
      } finally {
        setIsInitialLoading(false);
      }
    };
    
    initData();
  }, []);

  // Save data whenever it changes (DynamoDB only - no localStorage)
  useEffect(() => {
    const saveData = async () => {
      if ((data.expenseHeads.length > 0 || data.expenseEntries.length > 0) && cloudSyncEnabled) {
        try {
          await saveDataWithSync(data);
        } catch (error: any) {
          showSnackbar(`❌ Failed to save: ${error.message}`, 'error');
        }
      }
    };
    
    saveData();
  }, [data, cloudSyncEnabled]);

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Event operations
  const handleSaveEvent = (event: Omit<Event, 'id' | 'createdAt'>) => {
    const newEvent: Event = {
      ...event,
      id: `event-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setData({
      ...data,
      events: [...data.events, newEvent],
    });
    showSnackbar('Event created successfully');
  };

  const handleDeleteEvent = (eventId: string) => {
    // Delete event and all associated expense heads and entries
    const affectedHeadIds = data.expenseHeads
      .filter((head) => head.eventId === eventId)
      .map((head) => head.id);

    setData({
      events: data.events.filter((event) => event.id !== eventId),
      expenseHeads: data.expenseHeads.filter((head) => head.eventId !== eventId),
      expenseEntries: data.expenseEntries.filter(
        (entry) => !affectedHeadIds.includes(entry.expenseHeadId)
      ),
    });
    showSnackbar('Event deleted successfully');
  };

  // Expense Head operations
  const handleSaveExpenseHead = (expenseHead: Omit<ExpenseHead, 'id' | 'createdAt'>) => {
    const newExpenseHead: ExpenseHead = {
      ...expenseHead,
      id: `head-${Date.now()}`,
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
      ...data,
      expenseHeads: data.expenseHeads.filter((head) => head.id !== expenseHeadId),
      expenseEntries: data.expenseEntries.filter((entry) => entry.expenseHeadId !== expenseHeadId),
    });
    showSnackbar('Expense head deleted successfully');
  };

  const handleUpdateExpenseHead = (expenseHeadId: string, newTotalAmount: number) => {
    setData({
      ...data,
      expenseHeads: data.expenseHeads.map((head) =>
        head.id === expenseHeadId ? { ...head, totalAmount: newTotalAmount } : head
      ),
    });
    showSnackbar('Expense head updated successfully');
  };

  // Expense Entry operations
  const handleSaveExpenseEntry = (entry: Omit<ExpenseEntry, 'id'>) => {
    const newEntry: ExpenseEntry = {
      ...entry,
      id: Date.now().toString(),
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

  // Calculate event stats
  const eventsWithStats: EventWithStats[] = data.events.map((event) => {
    const eventExpenseHeads = data.expenseHeads.filter((head) => head.eventId === event.id);
    const totalBudget = eventExpenseHeads.reduce((sum, head) => sum + head.totalAmount, 0);
    const totalSpent = eventExpenseHeads.reduce((sum, head) => sum + getAmountPaid(head.id), 0);
    const totalDue = totalBudget - totalSpent;

    return {
      ...event,
      totalExpenseHeads: eventExpenseHeads.length,
      totalBudget,
      totalSpent,
      totalDue,
    };
  });

  // Group expenses by event
  const expensesByEvent = new Map<string, ExpenseWithStats[]>();
  expensesWithStats.forEach((expense) => {
    if (!expensesByEvent.has(expense.eventId)) {
      expensesByEvent.set(expense.eventId, []);
    }
    expensesByEvent.get(expense.eventId)!.push(expense);
  });

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

  // Manual cloud sync
  const handleManualSync = async () => {
    if (!cloudSyncEnabled) {
      showSnackbar('⚠️ Cloud sync not configured. Please set up AWS Cognito.', 'error');
      return;
    }

    setIsSyncing(true);
    const result = await syncToCloud(data);
    
    if (result.success) {
      const syncStatus = getSyncStatus();
      const lastSyncDate = syncStatus.lastSync ? new Date(syncStatus.lastSync).toLocaleString() : 'now';
      showSnackbar(`✅ Synced to DynamoDB (${lastSyncDate})`, 'success');
    } else {
      showSnackbar(`❌ Sync failed: ${result.error}`, 'error');
    }
    
    setIsSyncing(false);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importDataFromJSON(file)
        .then((importedData) => {
          const { mergedData, stats } = mergeImportedData(data, importedData);
          setData(mergedData);
          
          // Create detailed success message
          const messages = [];
          if (stats.addedEvents > 0) messages.push(`${stats.addedEvents} event(s)`);
          if (stats.addedHeads > 0) messages.push(`${stats.addedHeads} expense head(s)`);
          if (stats.addedEntries > 0) messages.push(`${stats.addedEntries} entry/entries`);
          
          const skippedMessages = [];
          if (stats.skippedEvents > 0) skippedMessages.push(`${stats.skippedEvents} duplicate event(s)`);
          if (stats.skippedHeads > 0) skippedMessages.push(`${stats.skippedHeads} duplicate head(s)`);
          if (stats.skippedEntries > 0) skippedMessages.push(`${stats.skippedEntries} duplicate entry/entries`);
          
          let message = 'Import completed: ';
          if (messages.length > 0) {
            message += `Added ${messages.join(', ')}`;
          } else {
            message += 'No new items';
          }
          
          if (skippedMessages.length > 0) {
            message += `. Skipped ${skippedMessages.join(', ')}`;
          }
          
          showSnackbar(message, 'success');
        })
        .catch((error) => {
          showSnackbar('Failed to import data: ' + error.message, 'error');
        });
      // Reset the input
      event.target.value = '';
    }
  };

  const handleAddExpenseHeadForEvent = (eventId: string) => {
    setPreSelectedEventId(eventId);
    setExpenseHeadDialogOpen(true);
  };

  // Clear all data from DynamoDB
  const handleClearAllData = async () => {
    if (confirmText !== 'DELETE ALL') {
      showSnackbar('Please type "DELETE ALL" to confirm', 'error');
      return;
    }

    if (!cloudSyncEnabled) {
      showSnackbar('Cloud sync not enabled', 'error');
      setClearDataDialogOpen(false);
      setConfirmText('');
      return;
    }

    setIsSyncing(true);
    const result = await clearAllCloudData();
    
    if (result.success) {
      // Clear local state
      setData({ events: [], expenseHeads: [], expenseEntries: [] });
      showSnackbar('✅ All data cleared from DynamoDB', 'success');
    } else {
      showSnackbar(`❌ Failed to clear data: ${result.error}`, 'error');
    }
    
    setIsSyncing(false);
    setClearDataDialogOpen(false);
    setConfirmText('');
  };

  const handleOpenEventDialog = () => {
    setEventDialogOpen(true);
  };

  const handleCloseEventDialog = () => {
    setEventDialogOpen(false);
  };

  const handleOpenExpenseHeadDialog = () => {
    setPreSelectedEventId(undefined);
    setExpenseHeadDialogOpen(true);
  };

  const handleCloseExpenseHeadDialog = () => {
    setExpenseHeadDialogOpen(false);
    setPreSelectedExpenseHeadId(undefined);
    setPreSelectedEventId(undefined);
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
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                {cloudSyncEnabled && (
                  <Tooltip title={isSyncing ? 'Syncing...' : 'Sync to Cloud'}>
                    <IconButton 
                      color="inherit" 
                      onClick={handleManualSync}
                      disabled={isSyncing}
                    >
                      {isSyncing ? <SyncIcon className="rotating" /> : <CloudIcon />}
                    </IconButton>
                  </Tooltip>
                )}
                {!cloudSyncEnabled && (
                  <Tooltip title="Cloud sync disabled (offline mode)">
                    <CloudOffIcon sx={{ opacity: 0.5, mr: 1 }} />
                  </Tooltip>
                )}
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
                <Tooltip title="Settings">
                  <IconButton 
                    color="inherit" 
                    onClick={() => setSettingsDialogOpen(true)}
                  >
                    <SettingsIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
            
            {isMobile && (
              <Tooltip title="Settings">
                <IconButton 
                  color="inherit" 
                  onClick={() => setSettingsDialogOpen(true)}
                >
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
            )}
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flex: 1 }}>
          {isInitialLoading ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60vh',
                gap: 2,
              }}
            >
              <CircularProgress size={60} thickness={4} />
              <Typography variant="h6" color="text.secondary">
                Loading your expenses...
              </Typography>
            </Box>
          ) : (
            <EventsList
              events={eventsWithStats}
              expensesByEvent={expensesByEvent}
              onViewHistory={handleViewHistory}
              onDeleteExpense={handleDeleteExpenseHead}
              onDeleteEvent={handleDeleteEvent}
              onAddExpenseHead={handleAddExpenseHeadForEvent}
              onUpdateExpenseHead={handleUpdateExpenseHead}
            />
          )}
        </Container>

        {/* Desktop SpeedDial */}
        {!isMobile && !isInitialLoading && (
          <SpeedDial
            ariaLabel="Add actions"
            sx={{ position: 'fixed', bottom: 16, right: 16 }}
            icon={<AddIcon />}
            open={speedDialOpen}
            onClose={() => setSpeedDialOpen(false)}
            onOpen={() => setSpeedDialOpen(true)}
          >
            <SpeedDialAction
              icon={<EventIcon />}
              tooltipTitle="Create Event"
              onClick={() => {
                setSpeedDialOpen(false);
                handleOpenEventDialog();
              }}
            />
            <SpeedDialAction
              icon={<CategoryIcon />}
              tooltipTitle="Add Expense Head"
              onClick={() => {
                setSpeedDialOpen(false);
                handleOpenExpenseHeadDialog();
              }}
            />
          </SpeedDial>
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
                } else if (newValue === 'sync') {
                  handleManualSync();
                  // Reset back to expenses view
                  setTimeout(() => setCurrentView('expenses'), 100);
                }
              }}
            >
              <BottomNavigationAction label="Expenses" value="expenses" icon={<ReceiptIcon />} disabled={isInitialLoading} />
              <BottomNavigationAction label="Add Entry" value="add" icon={<AddIcon />} disabled={isInitialLoading} />
              <BottomNavigationAction
                label={cloudSyncEnabled ? "Sync" : "Sync Off"}
                value="sync"
                icon={isSyncing ? <SyncIcon className="rotating" /> : (cloudSyncEnabled ? <CloudIcon /> : <CloudOffIcon />)}
                disabled={isSyncing || isInitialLoading}
              />
              <BottomNavigationAction
                label="Export"
                value="export"
                icon={<FileUploadIcon />}
                onClick={handleExport}
                disabled={isInitialLoading}
              />
            </BottomNavigation>
          </Paper>
        )}

        {/* Mobile SpeedDial */}
        {isMobile && !isInitialLoading && (
          <SpeedDial
            ariaLabel="Add actions"
            sx={{ position: 'fixed', bottom: 80, right: 16 }}
            icon={<AddIcon />}
            open={speedDialOpen}
            onClose={() => setSpeedDialOpen(false)}
            onOpen={() => setSpeedDialOpen(true)}
          >
            <SpeedDialAction
              icon={<EventIcon />}
              tooltipTitle="Create Event"
              onClick={() => {
                setSpeedDialOpen(false);
                handleOpenEventDialog();
              }}
            />
            <SpeedDialAction
              icon={<CategoryIcon />}
              tooltipTitle="Add Expense Head"
              onClick={() => {
                setSpeedDialOpen(false);
                handleOpenExpenseHeadDialog();
              }}
            />
          </SpeedDial>
        )}

        {/* Dialogs */}
        <EventDialog
          open={eventDialogOpen}
          onClose={handleCloseEventDialog}
          onSave={handleSaveEvent}
        />

        <ExpenseHeadDialog
          open={expenseHeadDialogOpen}
          onClose={handleCloseExpenseHeadDialog}
          onSave={handleSaveExpenseHead}
          events={data.events}
          onAddEvent={handleOpenEventDialog}
          preSelectedEventId={preSelectedEventId}
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

        {/* Settings Dialog */}
        <Dialog
          open={settingsDialogOpen}
          onClose={() => setSettingsDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              m: { xs: 1, sm: 2 },
              maxHeight: { xs: 'calc(100% - 16px)', sm: 'calc(100% - 64px)' },
            }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>Settings</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              {/* Cloud Sync Status */}
              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Cloud Sync Status
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {cloudSyncEnabled ? (
                    <>
                      <CloudIcon color="success" />
                      <Typography variant="body2" color="success.main">
                        Connected to DynamoDB
                      </Typography>
                    </>
                  ) : (
                    <>
                      <CloudOffIcon color="error" />
                      <Typography variant="body2" color="error.main">
                        Cloud sync not configured
                      </Typography>
                    </>
                  )}
                </Box>
              </Box>

              {/* Danger Zone */}
              {cloudSyncEnabled && (
                <Box sx={{ p: 2, bgcolor: 'error.main', color: 'error.contrastText', borderRadius: 2 }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                    ⚠️ Danger Zone
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                    Permanently delete all data from DynamoDB. This action cannot be undone.
                  </Typography>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<DeleteForeverIcon />}
                    onClick={() => {
                      setSettingsDialogOpen(false);
                      setClearDataDialogOpen(true);
                    }}
                    fullWidth
                    sx={{
                      bgcolor: 'error.dark',
                      '&:hover': {
                        bgcolor: 'error.darker',
                      },
                    }}
                  >
                    Clear All Data from DynamoDB
                  </Button>
                </Box>
              )}

              {/* App Info */}
              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  About
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Expense Manager - Track your event expenses and payments
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Version 1.0.0
                </Typography>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setSettingsDialogOpen(false)} size="large">
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Clear All Data Confirmation Dialog */}
        <Dialog 
          open={clearDataDialogOpen} 
          onClose={() => {
            setClearDataDialogOpen(false);
            setConfirmText('');
          }}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              m: { xs: 1, sm: 2 },
              maxHeight: { xs: 'calc(100% - 16px)', sm: 'calc(100% - 64px)' },
            }
          }}
        >
          <DialogTitle sx={{ bgcolor: 'error.main', color: 'error.contrastText', pb: 2 }}>
            ⚠️ Clear All Data
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                <strong>WARNING: This action is IRREVERSIBLE!</strong>
              </Typography>
              <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                This will permanently delete ALL data from DynamoDB:
              </Typography>
              <Box component="ul" sx={{ mt: 1, mb: 0, pl: { xs: 2, sm: 2.5 } }}>
                <li>All events</li>
                <li>All expense heads</li>
                <li>All expense entries</li>
                <li>All payment history</li>
              </Box>
            </Alert>
            
            <Typography variant="body2" gutterBottom sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
              Before proceeding:
            </Typography>
            <Box component="ol" sx={{ mt: 1, mb: 2, pl: { xs: 2, sm: 2.5 } }}>
              <li>Export your data as a backup</li>
              <li>Make sure you really want to delete everything</li>
              <li>Type <strong>DELETE ALL</strong> below to confirm</li>
            </Box>

            <TextField
              fullWidth
              label="Type DELETE ALL to confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE ALL"
              autoFocus
              size="medium"
              error={confirmText !== '' && confirmText !== 'DELETE ALL'}
              helperText={confirmText !== '' && confirmText !== 'DELETE ALL' ? 'Must type exactly: DELETE ALL' : ''}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button 
              onClick={() => {
                setClearDataDialogOpen(false);
                setConfirmText('');
              }}
              size="large"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleClearAllData}
              variant="contained"
              color="error"
              disabled={confirmText !== 'DELETE ALL' || isSyncing}
              size="large"
            >
              {isSyncing ? 'Clearing...' : 'Clear All Data'}
            </Button>
          </DialogActions>
        </Dialog>

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
