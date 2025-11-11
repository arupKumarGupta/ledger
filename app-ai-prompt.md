# Expense Manager and ledger app
Goal is to create an expense manager app in React which can be opened in mobile as well. So this has to be responsive using material ui for react with a mobile first approach. clean the boilerplates.
It should have below features
1. A screen/popup to create an expense. it will have 3 things name, category and total amount.
2. Screen to create an expense
    -it will have Expense head dropdown typeahead, amount being paid. in case amount being paid is greater than the remaining amount add a warning but allow it.
    - it should also have a way to add a new expense head using a + button on bottom right. this will basically open the create expense head popup. on creating from here it should be auto selected in create expense page. 
    - it should save the entry along with date and time.
    - it should also have an optional input to upload image and save it as base64 
    - add optional date and time input while creating expenses. prioritise them if provided else use current 
3. Expenses List screen to show all expense heads with total amount, amount due. a eye icon button to show history of payments listed in chronological order and a delete icon to delete whole expense head.
    - the history screen should have a way to delete (delete icon) / update the amount paid (click on amount inline) the values inline.
    - The delete icon button to delete whole expense head should show a confirmation modal before deleting.
4. All the data to be stored in localstorage or corresponding mobile storage.
5. IMPORTANT FEATURE: Import and export as json. 
    - there should be 2 icons on top right with labels as Import (with download icon) and Export (with upload icon)
    - on clicking import it should allow to import a json file containing expense data.
    - on export it should export the current data in a json file with a name as expenses-<date>-<time>.json

While creating this app use types strictly. and it should be fully responsive and use material ui icons for react. 
The theme of the app should be based on the system theme. 