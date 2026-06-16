{\rtf1\ansi\ansicpg1252\cocoartf2822
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 Menlo-Regular;}
{\colortbl;\red255\green255\blue255;\red20\green67\blue174;\red246\green247\blue249;\red46\green49\blue51;
\red186\green6\blue115;\red162\green0\blue16;\red77\green80\blue85;\red0\green0\blue0;\red18\green115\blue126;
\red97\green3\blue173;}
{\*\expandedcolortbl;;\cssrgb\c9412\c35294\c73725;\cssrgb\c97255\c97647\c98039;\cssrgb\c23529\c25098\c26275;
\cssrgb\c78824\c15294\c52549;\cssrgb\c70196\c7843\c7059;\cssrgb\c37255\c38824\c40784;\cssrgb\c0\c0\c0;\cssrgb\c3529\c52157\c56863;
\cssrgb\c46275\c15294\c73333;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs26 \cf2 \cb3 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 const\cf4 \strokec4  \cf5 \strokec5 SECRET_TOKEN\cf4 \strokec4  = \cf6 \strokec6 "FieldScan2025!SecureToken"\cf4 \strokec4 ; \cf7 \strokec7 // Must match frontend\cf4 \cb1 \strokec4 \
\cf2 \cb3 \strokec2 const\cf4 \strokec4  \cf5 \strokec5 SHEET_SCHEMAS\cf4 \strokec4  = \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf5 \strokec5 Projects\cf4 \strokec4 : [\cf6 \strokec6 "projectId"\cf4 \strokec4 ,\cf6 \strokec6 "clientName"\cf4 \strokec4 ,\cf6 \strokec6 "siteLocation"\cf4 \strokec4 ,\cf6 \strokec6 "clientPhone"\cf4 \strokec4 ,\cf6 \strokec6 "clientEmail"\cf4 \strokec4 ,\cf6 \strokec6 "projectStatus"\cf4 \strokec4 ,\cf6 \strokec6 "scope"\cf4 \strokec4 ,\cf6 \strokec6 "notes"\cf4 \strokec4 ,\cf6 \strokec6 "lastModified"\cf4 \strokec4 ],\cb1 \
\cb3   \cf5 \strokec5 Inspections\cf4 \strokec4 : [\cf6 \strokec6 "inspectionId"\cf4 \strokec4 ,\cf6 \strokec6 "projectId"\cf4 \strokec4 ,\cf6 \strokec6 "inspectionDate"\cf4 \strokec4 ,\cf6 \strokec6 "inspectionType"\cf4 \strokec4 ,\cf6 \strokec6 "areaInspected"\cf4 \strokec4 ,\cf6 \strokec6 "siteCondition"\cf4 \strokec4 ,\cf6 \strokec6 "recommendations"\cf4 \strokec4 ,\cf6 \strokec6 "attachments"\cf4 \strokec4 ,\cf6 \strokec6 "lastModified"\cf4 \strokec4 ],\cb1 \
\cb3   \cf5 \strokec5 TakeOffItems\cf4 \strokec4 : [\cf6 \strokec6 "itemId"\cf4 \strokec4 ,\cf6 \strokec6 "projectId"\cf4 \strokec4 ,\cf6 \strokec6 "roomArea"\cf4 \strokec4 ,\cf6 \strokec6 "tradeCategory"\cf4 \strokec4 ,\cf6 \strokec6 "description"\cf4 \strokec4 ,\cf6 \strokec6 "quantity"\cf4 \strokec4 ,\cf6 \strokec6 "unit"\cf4 \strokec4 ,\cf6 \strokec6 "beforePhotoUrl"\cf4 \strokec4 ,\cf6 \strokec6 "scopeNotes"\cf4 \strokec4 ,\cf6 \strokec6 "lastModified"\cf4 \strokec4 ],\cb1 \
\cb3   \cf5 \strokec5 ProgressLogs\cf4 \strokec4 : [\cf6 \strokec6 "logId"\cf4 \strokec4 ,\cf6 \strokec6 "projectId"\cf4 \strokec4 ,\cf6 \strokec6 "tradeCategory"\cf4 \strokec4 ,\cf6 \strokec6 "completionPercentage"\cf4 \strokec4 ,\cf6 \strokec6 "commentNarrative"\cf4 \strokec4 ,\cf6 \strokec6 "progressPhotoUrl"\cf4 \strokec4 ,\cf6 \strokec6 "dateRecorded"\cf4 \strokec4 ,\cf6 \strokec6 "lastModified"\cf4 \strokec4 ],\cb1 \
\cb3   \cf5 \strokec5 Snags\cf4 \strokec4 : [\cf6 \strokec6 "snagId"\cf4 \strokec4 ,\cf6 \strokec6 "projectId"\cf4 \strokec4 ,\cf6 \strokec6 "notes"\cf4 \strokec4 ,\cf6 \strokec6 "photoUrl"\cf4 \strokec4 ,\cf6 \strokec6 "assigned"\cf4 \strokec4 ,\cf6 \strokec6 "dateLogged"\cf4 \strokec4 ,\cf6 \strokec6 "dateCompleted"\cf4 \strokec4 ,\cf6 \strokec6 "status"\cf4 \strokec4 ,\cf6 \strokec6 "lastModified"\cf4 \strokec4 ],\cb1 \
\cb3   \cf5 \strokec5 Vendors\cf4 \strokec4 : [\cf6 \strokec6 "vendorId"\cf4 \strokec4 ,\cf6 \strokec6 "company"\cf4 \strokec4 ,\cf6 \strokec6 "trade"\cf4 \strokec4 ,\cf6 \strokec6 "contactName"\cf4 \strokec4 ,\cf6 \strokec6 "phone1"\cf4 \strokec4 ,\cf6 \strokec6 "phone2"\cf4 \strokec4 ,\cf6 \strokec6 "email"\cf4 \strokec4 ,\cf6 \strokec6 "passport"\cf4 \strokec4 ,\cf6 \strokec6 "attachments"\cf4 \strokec4 ,\cf6 \strokec6 "archived"\cf4 \strokec4 ,\cf6 \strokec6 "lastModified"\cf4 \strokec4 ],\cb1 \
\cb3   \cf5 \strokec5 WorkOrders\cf4 \strokec4 : [\cf6 \strokec6 "workOrderId"\cf4 \strokec4 ,\cf6 \strokec6 "projectId"\cf4 \strokec4 ,\cf6 \strokec6 "vendorId"\cf4 \strokec4 ,\cf6 \strokec6 "description"\cf4 \strokec4 ,\cf6 \strokec6 "amount"\cf4 \strokec4 ,\cf6 \strokec6 "status"\cf4 \strokec4 ,\cf6 \strokec6 "attachments"\cf4 \strokec4 ,\cf6 \strokec6 "dateCreated"\cf4 \strokec4 ,\cf6 \strokec6 "lastModified"\cf4 \strokec4 ],\cb1 \
\cb3   \cf5 \strokec5 Payments\cf4 \strokec4 : [\cf6 \strokec6 "paymentId"\cf4 \strokec4 ,\cf6 \strokec6 "projectId"\cf4 \strokec4 ,\cf6 \strokec6 "paymentDate"\cf4 \strokec4 ,\cf6 \strokec6 "paymentDirection"\cf4 \strokec4 ,\cf6 \strokec6 "payee"\cf4 \strokec4 ,\cf6 \strokec6 "expenseCategory"\cf4 \strokec4 ,\cf6 \strokec6 "referenceId"\cf4 \strokec4 ,\cf6 \strokec6 "amount"\cf4 \strokec4 ,\cf6 \strokec6 "paymentMethod"\cf4 \strokec4 ,\cf6 \strokec6 "status"\cf4 \strokec4 ,\cf6 \strokec6 "notes"\cf4 \strokec4 ,\cf6 \strokec6 "attachments"\cf4 \strokec4 ,\cf6 \strokec6 "lastModified"\cf4 \strokec4 ]\cb1 \
\cb3 \};\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 function\cf4 \strokec4  \strokec8 doPost\strokec4 (\strokec8 e\strokec4 ) \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \strokec2 let\cf4 \strokec4  \strokec8 result\strokec4  = \{ \strokec8 success\strokec4 : \cf2 \strokec2 false\cf4 \strokec4 , \strokec8 status\strokec4 : \cf6 \strokec6 "error"\cf4 \strokec4  \};\cb1 \
\cb3   \cf2 \strokec2 try\cf4 \strokec4  \{\cb1 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  \strokec8 req\strokec4  = \cf5 \strokec5 JSON\cf4 \strokec4 .\strokec8 parse\strokec4 (\strokec8 e\strokec4 .\strokec8 postData\strokec4 .\strokec8 contents\strokec4 );\cb1 \
\cb3     \cf2 \strokec2 if\cf4 \strokec4  (\strokec8 req\strokec4 .\strokec8 data\strokec4 ?.\strokec8 token\strokec4  !== \cf5 \strokec5 SECRET_TOKEN\cf4 \strokec4  && \strokec8 req\strokec4 .\strokec8 token\strokec4  !== \cf5 \strokec5 SECRET_TOKEN\cf4 \strokec4 ) \cf2 \strokec2 throw\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf5 \strokec5 Error\cf4 \strokec4 (\cf6 \strokec6 "Unauthorized"\cf4 \strokec4 );\cb1 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  \strokec8 action\strokec4  = \strokec8 req\strokec4 .\strokec8 action\strokec4 ;\cb1 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  \strokec8 data\strokec4  = \strokec8 req\strokec4 .\strokec8 data\strokec4  || \{\};\cb1 \
\cb3     \cf2 \strokec2 if\cf4 \strokec4  (\strokec8 action\strokec4  === \cf6 \strokec6 "getProjects"\cf4 \strokec4 ) \strokec8 result\strokec4  = \strokec8 getTableData\strokec4 (\cf6 \strokec6 "Projects"\cf4 \strokec4 );\cb1 \
\cb3     \cf2 \strokec2 else\cf4 \strokec4  \cf2 \strokec2 if\cf4 \strokec4  (\strokec8 action\strokec4  === \cf6 \strokec6 "getInspections"\cf4 \strokec4 ) \strokec8 result\strokec4  = \strokec8 getTableData\strokec4 (\cf6 \strokec6 "Inspections"\cf4 \strokec4 );\cb1 \
\cb3     \cf2 \strokec2 else\cf4 \strokec4  \cf2 \strokec2 if\cf4 \strokec4  (\strokec8 action\strokec4  === \cf6 \strokec6 "getTakeOffItems"\cf4 \strokec4 ) \strokec8 result\strokec4  = \strokec8 getTableData\strokec4 (\cf6 \strokec6 "TakeOffItems"\cf4 \strokec4 );\cb1 \
\cb3     \cf2 \strokec2 else\cf4 \strokec4  \cf2 \strokec2 if\cf4 \strokec4  (\strokec8 action\strokec4  === \cf6 \strokec6 "getProgressLogs"\cf4 \strokec4 ) \strokec8 result\strokec4  = \strokec8 getTableData\strokec4 (\cf6 \strokec6 "ProgressLogs"\cf4 \strokec4 );\cb1 \
\cb3     \cf2 \strokec2 else\cf4 \strokec4  \cf2 \strokec2 if\cf4 \strokec4  (\strokec8 action\strokec4  === \cf6 \strokec6 "getVendors"\cf4 \strokec4 ) \strokec8 result\strokec4  = \strokec8 getTableData\strokec4 (\cf6 \strokec6 "Vendors"\cf4 \strokec4 );\cb1 \
\cb3     \cf2 \strokec2 else\cf4 \strokec4  \cf2 \strokec2 if\cf4 \strokec4  (\strokec8 action\strokec4  === \cf6 \strokec6 "getWorkOrders"\cf4 \strokec4 ) \strokec8 result\strokec4  = \strokec8 getTableData\strokec4 (\cf6 \strokec6 "WorkOrders"\cf4 \strokec4 );\cb1 \
\cb3     \cf2 \strokec2 else\cf4 \strokec4  \cf2 \strokec2 if\cf4 \strokec4  (\strokec8 action\strokec4  === \cf6 \strokec6 "getPayments"\cf4 \strokec4 ) \strokec8 result\strokec4  = \strokec8 getTableData\strokec4 (\cf6 \strokec6 "Payments"\cf4 \strokec4 );\cb1 \
\cb3     \cf2 \strokec2 else\cf4 \strokec4  \cf2 \strokec2 if\cf4 \strokec4  (\strokec8 action\strokec4  === \cf6 \strokec6 "getSnags"\cf4 \strokec4 ) \strokec8 result\strokec4  = \strokec8 getTableData\strokec4 (\cf6 \strokec6 "Snags"\cf4 \strokec4 );\cb1 \
\cb3     \cf2 \strokec2 else\cf4 \strokec4  \cf2 \strokec2 if\cf4 \strokec4  (\strokec8 action\strokec4  === \cf6 \strokec6 "getStats"\cf4 \strokec4 ) \strokec8 result\strokec4  = \{ \strokec8 success\strokec4 : \cf2 \strokec2 true\cf4 \strokec4 , \strokec8 activeVendors\strokec4 : \strokec8 getActiveVendorsCount\strokec4 () \};\cb1 \
\cb3     \cf2 \strokec2 else\cf4 \strokec4  \cf2 \strokec2 if\cf4 \strokec4  (\strokec8 action\strokec4  === \cf6 \strokec6 "saveProject"\cf4 \strokec4 ) \strokec8 result\strokec4  = \strokec8 saveProject\strokec4 (\strokec8 data\strokec4 );\cb1 \
\cb3     \cf2 \strokec2 else\cf4 \strokec4  \cf2 \strokec2 if\cf4 \strokec4  (\strokec8 action\strokec4  === \cf6 \strokec6 "updateProject"\cf4 \strokec4 ) \strokec8 result\strokec4  = \strokec8 updateProject\strokec4 (\strokec8 data\strokec4 );\cb1 \
\cb3     \cf2 \strokec2 else\cf4 \strokec4  \cf2 \strokec2 if\cf4 \strokec4  (\strokec8 action\strokec4  === \cf6 \strokec6 "updateProjectScope"\cf4 \strokec4 ) \strokec8 result\strokec4  = \strokec8 updateProjectScope\strokec4 (\strokec8 data\strokec4 );\cb1 \
\cb3     \cf2 \strokec2 else\cf4 \strokec4  \cf2 \strokec2 if\cf4 \strokec4  (\strokec8 action\strokec4  === \cf6 \strokec6 "saveInspection"\cf4 \strokec4 ) \strokec8 result\strokec4  = \strokec8 saveInspection\strokec4 (\strokec8 data\strokec4 );\cb1 \
\cb3     \cf2 \strokec2 else\cf4 \strokec4  \cf2 \strokec2 if\cf4 \strokec4  (\strokec8 action\strokec4  === \cf6 \strokec6 "updateInspection"\cf4 \strokec4 ) \strokec8 result\strokec4  = \strokec8 updateInspection\strokec4 (\strokec8 data\strokec4 );\cb1 \
\cb3     \cf2 \strokec2 else\cf4 \strokec4  \cf2 \strokec2 if\cf4 \strokec4  (\strokec8 action\strokec4  === \cf6 \strokec6 "saveTakeOffItem"\cf4 \strokec4 ) \strokec8 result\strokec4  = \strokec8 saveTakeOffItem\strokec4 (\strokec8 data\strokec4 );\cb1 \
\cb3     \cf2 \strokec2 else\cf4 \strokec4  \cf2 \strokec2 if\cf4 \strokec4  (\strokec8 action\strokec4  === \cf6 \strokec6 "updateTakeOffItem"\cf4 \strokec4 ) \strokec8 result\strokec4  = \strokec8 updateTakeOffItem\strokec4 (\strokec8 data\strokec4 );\cb1 \
\cb3     \cf2 \strokec2 else\cf4 \strokec4  \cf2 \strokec2 if\cf4 \strokec4  (\strokec8 action\strokec4  === \cf6 \strokec6 "deleteTakeOffItem"\cf4 \strokec4 ) \strokec8 result\strokec4  = \strokec8 deleteRow\strokec4 (\cf6 \strokec6 "TakeOffItems"\cf4 \strokec4 , \strokec8 data\strokec4 .\strokec8 itemId\strokec4 , \cf9 \strokec9 0\cf4 \strokec4 );\cb1 \
\cb3     \cf2 \strokec2 else\cf4 \strokec4  \cf2 \strokec2 if\cf4 \strokec4  (\strokec8 action\strokec4  === \cf6 \strokec6 "saveProgressLog"\cf4 \strokec4 ) \strokec8 result\strokec4  = \strokec8 saveProgressLog\strokec4 (\strokec8 data\strokec4 );\cb1 \
\cb3     \cf2 \strokec2 else\cf4 \strokec4  \cf2 \strokec2 if\cf4 \strokec4  (\strokec8 action\strokec4  === \cf6 \strokec6 "saveSnag"\cf4 \strokec4 ) \strokec8 result\strokec4  = \strokec8 saveSnag\strokec4 (\strokec8 data\strokec4 );\cb1 \
\cb3     \cf2 \strokec2 else\cf4 \strokec4  \cf2 \strokec2 if\cf4 \strokec4  (\strokec8 action\strokec4  === \cf6 \strokec6 "updateSnag"\cf4 \strokec4 ) \strokec8 result\strokec4  = \strokec8 updateSnag\strokec4 (\strokec8 data\strokec4 );\cb1 \
\cb3     \cf2 \strokec2 else\cf4 \strokec4  \cf2 \strokec2 if\cf4 \strokec4  (\strokec8 action\strokec4  === \cf6 \strokec6 "deleteSnag"\cf4 \strokec4 ) \strokec8 result\strokec4  = \strokec8 deleteRow\strokec4 (\cf6 \strokec6 "Snags"\cf4 \strokec4 , \strokec8 data\strokec4 .\strokec8 snagId\strokec4 , \cf9 \strokec9 0\cf4 \strokec4 );\cb1 \
\cb3     \cf2 \strokec2 else\cf4 \strokec4  \cf2 \strokec2 if\cf4 \strokec4  (\strokec8 action\strokec4  === \cf6 \strokec6 "saveVendor"\cf4 \strokec4 ) \strokec8 result\strokec4  = \strokec8 saveVendor\strokec4 (\strokec8 data\strokec4 );\cb1 \
\cb3     \cf2 \strokec2 else\cf4 \strokec4  \cf2 \strokec2 if\cf4 \strokec4  (\strokec8 action\strokec4  === \cf6 \strokec6 "updateVendor"\cf4 \strokec4 ) \strokec8 result\strokec4  = \strokec8 updateVendor\strokec4 (\strokec8 data\strokec4 );\cb1 \
\cb3     \cf2 \strokec2 else\cf4 \strokec4  \cf2 \strokec2 if\cf4 \strokec4  (\strokec8 action\strokec4  === \cf6 \strokec6 "deleteVendor"\cf4 \strokec4 ) \strokec8 result\strokec4  = \strokec8 deleteRow\strokec4 (\cf6 \strokec6 "Vendors"\cf4 \strokec4 , \strokec8 data\strokec4 .\strokec8 vendorId\strokec4 , \cf9 \strokec9 0\cf4 \strokec4 );\cb1 \
\cb3     \cf2 \strokec2 else\cf4 \strokec4  \cf2 \strokec2 if\cf4 \strokec4  (\strokec8 action\strokec4  === \cf6 \strokec6 "saveWorkOrder"\cf4 \strokec4 ) \strokec8 result\strokec4  = \strokec8 saveWorkOrder\strokec4 (\strokec8 data\strokec4 );\cb1 \
\cb3     \cf2 \strokec2 else\cf4 \strokec4  \cf2 \strokec2 if\cf4 \strokec4  (\strokec8 action\strokec4  === \cf6 \strokec6 "updateWorkOrder"\cf4 \strokec4 ) \strokec8 result\strokec4  = \strokec8 updateWorkOrder\strokec4 (\strokec8 data\strokec4 );\cb1 \
\cb3     \cf2 \strokec2 else\cf4 \strokec4  \cf2 \strokec2 if\cf4 \strokec4  (\strokec8 action\strokec4  === \cf6 \strokec6 "savePayment"\cf4 \strokec4 ) \strokec8 result\strokec4  = \strokec8 savePayment\strokec4 (\strokec8 data\strokec4 );\cb1 \
\cb3     \cf2 \strokec2 else\cf4 \strokec4  \cf2 \strokec2 if\cf4 \strokec4  (\strokec8 action\strokec4  === \cf6 \strokec6 "updatePayment"\cf4 \strokec4 ) \strokec8 result\strokec4  = \strokec8 updatePayment\strokec4 (\strokec8 data\strokec4 );\cb1 \
\cb3     \cf2 \strokec2 else\cf4 \strokec4  \cf2 \strokec2 throw\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf5 \strokec5 Error\cf4 \strokec4 (\cf6 \strokec6 "Unknown action"\cf4 \strokec4 );\cb1 \
\cb3   \} \cf2 \strokec2 catch\cf4 \strokec4 (\strokec8 err\strokec4 ) \{\cb1 \
\cb3     \strokec8 result\strokec4  = \{ \strokec8 success\strokec4 : \cf2 \strokec2 false\cf4 \strokec4 , \strokec8 error\strokec4 : \strokec8 err\strokec4 .\strokec8 toString\strokec4 () \};\cb1 \
\cb3   \}\cb1 \
\cb3   \cf2 \strokec2 return\cf4 \strokec4  \cf5 \strokec5 ContentService\cf4 \strokec4 .\strokec8 createTextOutput\strokec4 (\cf5 \strokec5 JSON\cf4 \strokec4 .\strokec8 stringify\strokec4 (\strokec8 result\strokec4 )).\strokec8 setMimeType\strokec4 (\cf5 \strokec5 ContentService\cf4 \strokec4 .\cf5 \strokec5 MimeType\cf4 \strokec4 .\cf5 \strokec5 JSON\cf4 \strokec4 );\cb1 \
\cb3 \}\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 function\cf4 \strokec4  \strokec8 doGet\strokec4 (\strokec8 e\strokec4 ) \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \strokec2 const\cf4 \strokec4  \strokec8 id\strokec4  = \strokec8 e\strokec4 .\strokec8 parameter\strokec4 .\strokec8 id\strokec4 ;\cb1 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  \strokec8 token\strokec4  = \strokec8 e\strokec4 .\strokec8 parameter\strokec4 .\strokec8 token\strokec4 ;\cb1 \
\cb3   \cf2 \strokec2 if\cf4 \strokec4  (\strokec8 token\strokec4  !== \cf5 \strokec5 SECRET_TOKEN\cf4 \strokec4 ) \cf2 \strokec2 return\cf4 \strokec4  \cf5 \strokec5 ContentService\cf4 \strokec4 .\strokec8 createTextOutput\strokec4 (\cf6 \strokec6 "Unauthorized"\cf4 \strokec4 );\cb1 \
\cb3   \cf2 \strokec2 try\cf4 \strokec4  \{\cb1 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  \strokec8 file\strokec4  = \cf5 \strokec5 DriveApp\cf4 \strokec4 .\strokec8 getFileById\strokec4 (\strokec8 id\strokec4 );\cb1 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  \strokec8 blob\strokec4  = \strokec8 file\strokec4 .\strokec8 getBlob\strokec4 ();\cb1 \
\cb3     \cf2 \strokec2 return\cf4 \strokec4  \cf5 \strokec5 ContentService\cf4 \strokec4 .\strokec8 createTextOutput\strokec4 (\strokec8 blob\strokec4 .\strokec8 getDataAsString\strokec4 ()).\strokec8 setMimeType\strokec4 (\strokec8 blob\strokec4 .\strokec8 getContentType\strokec4 ());\cb1 \
\cb3   \} \cf2 \strokec2 catch\cf4 \strokec4 (\strokec8 err\strokec4 ) \{ \cf2 \strokec2 return\cf4 \strokec4  \cf5 \strokec5 ContentService\cf4 \strokec4 .\strokec8 createTextOutput\strokec4 (\cf6 \strokec6 "Not found"\cf4 \strokec4 ); \}\cb1 \
\cb3 \}\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf7 \cb3 \strokec7 // Helper: sanitize cell to prevent injection\cf4 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 function\cf4 \strokec4  \strokec8 sanitize\strokec4 (\strokec8 v\strokec4 ) \{ \cf2 \strokec2 if\cf4 \strokec4  (\cf2 \strokec2 typeof\cf4 \strokec4  \strokec8 v\strokec4  !== \cf6 \strokec6 'string'\cf4 \strokec4 ) \cf2 \strokec2 return\cf4 \strokec4  \strokec8 v\strokec4 ; \cf2 \strokec2 return\cf4 \strokec4  \strokec8 v\strokec4 .\strokec8 replace\strokec4 (\cf10 \strokec10 /^[=+\\-@]/\cf4 \strokec4 ,\cf6 \strokec6 ''\cf4 \strokec4 ).\strokec8 replace\strokec4 (\cf10 \strokec10 /=/\cf2 \strokec2 g\cf4 \strokec4 ,\cf6 \strokec6 ''\cf4 \strokec4 ).\strokec8 slice\strokec4 (\cf9 \strokec9 0\cf4 \strokec4 ,\cf9 \strokec9 5000\cf4 \strokec4 ); \}\cb1 \
\cf2 \cb3 \strokec2 function\cf4 \strokec4  \strokec8 validatePhone\strokec4 (\strokec8 p\strokec4 ) \{ \cf2 \strokec2 if\cf4 \strokec4  (!\strokec8 p\strokec4 ) \cf2 \strokec2 return\cf4 \strokec4  \cf6 \strokec6 ""\cf4 \strokec4 ; \cf2 \strokec2 const\cf4 \strokec4  \strokec8 clean\strokec4  = \strokec8 p\strokec4 .\strokec8 replace\strokec4 (\cf10 \strokec10 /\\D/\cf2 \strokec2 g\cf4 \strokec4 ,\cf6 \strokec6 ''\cf4 \strokec4 ); \cf2 \strokec2 if\cf4 \strokec4  (\strokec8 clean\strokec4 .\strokec8 length\strokec4  !== \cf9 \strokec9 11\cf4 \strokec4 ) \cf2 \strokec2 throw\cf4 \strokec4  \cf2 \strokec2 new\cf4 \strokec4  \cf5 \strokec5 Error\cf4 \strokec4 (\cf6 \strokec6 "Phone must be 11 digits"\cf4 \strokec4 ); \cf2 \strokec2 return\cf4 \strokec4  \strokec8 clean\strokec4 ; \}\cb1 \
\
\cf2 \cb3 \strokec2 function\cf4 \strokec4  \strokec8 getTableData\strokec4 (\strokec8 sheetName\strokec4 ) \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \strokec2 const\cf4 \strokec4  \strokec8 sheet\strokec4  = \strokec8 ensureSheet\strokec4 (\strokec8 sheetName\strokec4 );\cb1 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  \strokec8 data\strokec4  = \strokec8 sheet\strokec4 .\strokec8 getDataRange\strokec4 ().\strokec8 getValues\strokec4 ();\cb1 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  \strokec8 headers\strokec4  = \strokec8 data\strokec4 [\cf9 \strokec9 0\cf4 \strokec4 ].\strokec8 map\strokec4 (\strokec8 h\strokec4 =>\strokec8 normalizeHeader\strokec4 (\strokec8 h\strokec4 ));\cb1 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  \strokec8 schema\strokec4  = \cf5 \strokec5 SHEET_SCHEMAS\cf4 \strokec4 [\strokec8 sheetName\strokec4 ];\cb1 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  \strokec8 tz\strokec4  = \cf5 \strokec5 Session\cf4 \strokec4 .\strokec8 getScriptTimeZone\strokec4 ();\cb1 \
\cb3   \cf2 \strokec2 return\cf4 \strokec4  \strokec8 data\strokec4 .\strokec8 slice\strokec4 (\cf9 \strokec9 1\cf4 \strokec4 ).\strokec8 map\strokec4 (\strokec8 row\strokec4  => \{\cb1 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  \strokec8 obj\strokec4  = \{\};\cb1 \
\cb3     \strokec8 schema\strokec4 .\strokec8 forEach\strokec4 ((\strokec8 key\strokec4 ) => \{\cb1 \
\cb3       \cf2 \strokec2 let\cf4 \strokec4  \strokec8 val\strokec4  = \strokec8 row\strokec4 [\strokec8 headers\strokec4 .\strokec8 indexOf\strokec4 (\strokec8 normalizeHeader\strokec4 (\strokec8 key\strokec4 ))];\cb1 \
\cb3       \cf2 \strokec2 if\cf4 \strokec4  (\strokec8 val\strokec4  \cf2 \strokec2 instanceof\cf4 \strokec4  \cf5 \strokec5 Date\cf4 \strokec4 ) \{\cb1 \
\cb3         \cf7 \strokec7 // Sheets auto-converted a date-like string on write; reformat back to YYYY/MM/DD for date fields,\cf4 \cb1 \strokec4 \
\cb3         \cf7 \strokec7 // or keep the raw millisecond timestamp for lastModified.\cf4 \cb1 \strokec4 \
\cb3         \strokec8 val\strokec4  = (\strokec8 normalizeHeader\strokec4 (\strokec8 key\strokec4 ) === \strokec8 normalizeHeader\strokec4 (\cf6 \strokec6 "lastModified"\cf4 \strokec4 ))\cb1 \
\cb3           ? \strokec8 val\strokec4 .\strokec8 getTime\strokec4 ()\cb1 \
\cb3           : \cf5 \strokec5 Utilities\cf4 \strokec4 .\strokec8 formatDate\strokec4 (\strokec8 val\strokec4 , \strokec8 tz\strokec4 , \cf6 \strokec6 "yyyy/MM/dd"\cf4 \strokec4 );\cb1 \
\cb3       \}\cb1 \
\cb3       \strokec8 obj\strokec4 [\strokec8 key\strokec4 ] = \strokec8 val\strokec4  || \cf6 \strokec6 ""\cf4 \strokec4 ;\cb1 \
\cb3     \});\cb1 \
\cb3     \cf2 \strokec2 return\cf4 \strokec4  \strokec8 obj\strokec4 ;\cb1 \
\cb3   \});\cb1 \
\cb3 \}\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 function\cf4 \strokec4  \strokec8 saveProject\strokec4 (\strokec8 data\strokec4 ) \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \strokec2 const\cf4 \strokec4  \strokec8 id\strokec4  = \strokec8 data\strokec4 .\strokec8 projectId\strokec4  || \strokec8 getNextSequentialId\strokec4 (\cf6 \strokec6 "Projects"\cf4 \strokec4 , \cf6 \strokec6 "PRJ/"\cf4 \strokec4  + \cf5 \strokec5 Utilities\cf4 \strokec4 .\strokec8 formatDate\strokec4 (\cf2 \strokec2 new\cf4 \strokec4  \cf5 \strokec5 Date\cf4 \strokec4 (), \cf5 \strokec5 Session\cf4 \strokec4 .\strokec8 getScriptTimeZone\strokec4 (), \cf6 \strokec6 "yy"\cf4 \strokec4 ) + \cf6 \strokec6 "/"\cf4 \strokec4 , \cf9 \strokec9 3\cf4 \strokec4 );\cb1 \
\cb3   \strokec8 appendObjectRow\strokec4 (\cf6 \strokec6 "Projects"\cf4 \strokec4 , \{\cb1 \
\cb3     \strokec8 projectId\strokec4 : \strokec8 id\strokec4 ,\cb1 \
\cb3     \strokec8 clientName\strokec4 : \strokec8 sanitize\strokec4 (\strokec8 data\strokec4 .\strokec8 clientName\strokec4 ),\cb1 \
\cb3     \strokec8 siteLocation\strokec4 : \strokec8 sanitize\strokec4 (\strokec8 data\strokec4 .\strokec8 siteLocation\strokec4 ),\cb1 \
\cb3     \strokec8 clientPhone\strokec4 : \cf6 \strokec6 "'"\cf4 \strokec4 +\strokec8 validatePhone\strokec4 (\strokec8 data\strokec4 .\strokec8 clientPhone\strokec4 ),\cb1 \
\cb3     \strokec8 clientEmail\strokec4 : \strokec8 sanitize\strokec4 (\strokec8 data\strokec4 .\strokec8 clientEmail\strokec4 ),\cb1 \
\cb3     \strokec8 projectStatus\strokec4 : \strokec8 sanitize\strokec4 (\strokec8 data\strokec4 .\strokec8 projectStatus\strokec4 ),\cb1 \
\cb3     \strokec8 scope\strokec4 : \strokec8 sanitize\strokec4 (\strokec8 data\strokec4 .\strokec8 scope\strokec4 ),\cb1 \
\cb3     \strokec8 notes\strokec4 : \strokec8 sanitize\strokec4 (\strokec8 data\strokec4 .\strokec8 notes\strokec4 ),\cb1 \
\cb3     \strokec8 lastModified\strokec4 : \cf5 \strokec5 Date\cf4 \strokec4 .\strokec8 now\strokec4 ()\cb1 \
\cb3   \});\cb1 \
\cb3   \cf2 \strokec2 return\cf4 \strokec4  \{ \strokec8 success\strokec4 : \cf2 \strokec2 true\cf4 \strokec4 , \strokec8 projectId\strokec4 : \strokec8 id\strokec4  \};\cb1 \
\cb3 \}\cb1 \
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 function\cf4 \strokec4  \strokec8 updateProject\strokec4 (\strokec8 data\strokec4 ) \{ \cf2 \strokec2 return\cf4 \strokec4  \strokec8 modifyRow\strokec4 (\cf6 \strokec6 "Projects"\cf4 \strokec4 , \strokec8 data\strokec4 .\strokec8 projectId\strokec4 , \{ \strokec8 clientName\strokec4 : \strokec8 sanitize\strokec4 (\strokec8 data\strokec4 .\strokec8 clientName\strokec4 ), \strokec8 siteLocation\strokec4 : \strokec8 sanitize\strokec4 (\strokec8 data\strokec4 .\strokec8 siteLocation\strokec4 ), \strokec8 clientPhone\strokec4 : \cf6 \strokec6 "'"\cf4 \strokec4 +\strokec8 validatePhone\strokec4 (\strokec8 data\strokec4 .\strokec8 clientPhone\strokec4 ), \strokec8 clientEmail\strokec4 : \strokec8 sanitize\strokec4 (\strokec8 data\strokec4 .\strokec8 clientEmail\strokec4 ), \strokec8 projectStatus\strokec4 : \strokec8 sanitize\strokec4 (\strokec8 data\strokec4 .\strokec8 projectStatus\strokec4 ), \strokec8 scope\strokec4 : \strokec8 sanitize\strokec4 (\strokec8 data\strokec4 .\strokec8 scope\strokec4 ), \strokec8 notes\strokec4 : \strokec8 sanitize\strokec4 (\strokec8 data\strokec4 .\strokec8 notes\strokec4 ), \strokec8 lastModified\strokec4 : \cf5 \strokec5 Date\cf4 \strokec4 .\strokec8 now\strokec4 () \}, \cf9 \strokec9 0\cf4 \strokec4 ); \}\cb1 \
\cf2 \cb3 \strokec2 function\cf4 \strokec4  \strokec8 updateProjectScope\strokec4 (\strokec8 data\strokec4 ) \{ \cf2 \strokec2 return\cf4 \strokec4  \strokec8 modifyRow\strokec4 (\cf6 \strokec6 "Projects"\cf4 \strokec4 , \strokec8 data\strokec4 .\strokec8 projectId\strokec4 , \{ \strokec8 scope\strokec4 : \strokec8 sanitize\strokec4 (\strokec8 data\strokec4 .\strokec8 scope\strokec4 ), \strokec8 lastModified\strokec4 : \cf5 \strokec5 Date\cf4 \strokec4 .\strokec8 now\strokec4 () \}, \cf9 \strokec9 0\cf4 \strokec4 ); \}\cb1 \
\cf2 \cb3 \strokec2 function\cf4 \strokec4  \strokec8 saveInspection\strokec4 (\strokec8 data\strokec4 ) \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \strokec8 appendObjectRow\strokec4 (\cf6 \strokec6 "Inspections"\cf4 \strokec4 , \{\cb1 \
\cb3     \strokec8 inspectionId\strokec4 : \strokec8 data\strokec4 .\strokec8 inspectionId\strokec4 ,\cb1 \
\cb3     \strokec8 projectId\strokec4 : \strokec8 data\strokec4 .\strokec8 projectId\strokec4 ,\cb1 \
\cb3     \strokec8 inspectionDate\strokec4 : \strokec8 data\strokec4 .\strokec8 inspectionDate\strokec4  || \strokec8 currentDate\strokec4 (),\cb1 \
\cb3     \strokec8 inspectionType\strokec4 : \strokec8 data\strokec4 .\strokec8 inspectionType\strokec4 ,\cb1 \
\cb3     \strokec8 areaInspected\strokec4 : \strokec8 sanitize\strokec4 (\strokec8 data\strokec4 .\strokec8 areaInspected\strokec4 ),\cb1 \
\cb3     \strokec8 siteCondition\strokec4 : \strokec8 sanitize\strokec4 (\strokec8 data\strokec4 .\strokec8 siteCondition\strokec4 ),\cb1 \
\cb3     \strokec8 recommendations\strokec4 : \strokec8 sanitize\strokec4 (\strokec8 data\strokec4 .\strokec8 recommendations\strokec4 ),\cb1 \
\cb3     \strokec8 attachments\strokec4 : \strokec8 processAttachments\strokec4 (\strokec8 data\strokec4 .\strokec8 attachments\strokec4 ),\cb1 \
\cb3     \strokec8 lastModified\strokec4 : \cf5 \strokec5 Date\cf4 \strokec4 .\strokec8 now\strokec4 ()\cb1 \
\cb3   \});\cb1 \
\cb3   \cf2 \strokec2 return\cf4 \strokec4  \{ \strokec8 success\strokec4 : \cf2 \strokec2 true\cf4 \strokec4  \};\cb1 \
\cb3 \}\cb1 \
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 function\cf4 \strokec4  \strokec8 updateInspection\strokec4 (\strokec8 data\strokec4 ) \{ \cf2 \strokec2 return\cf4 \strokec4  \strokec8 modifyRow\strokec4 (\cf6 \strokec6 "Inspections"\cf4 \strokec4 , \strokec8 data\strokec4 .\strokec8 inspectionId\strokec4 , \{ \strokec8 inspectionDate\strokec4 : \strokec8 data\strokec4 .\strokec8 inspectionDate\strokec4 , \strokec8 inspectionType\strokec4 : \strokec8 data\strokec4 .\strokec8 inspectionType\strokec4 , \strokec8 areaInspected\strokec4 : \strokec8 sanitize\strokec4 (\strokec8 data\strokec4 .\strokec8 areaInspected\strokec4 ), \strokec8 siteCondition\strokec4 : \strokec8 sanitize\strokec4 (\strokec8 data\strokec4 .\strokec8 siteCondition\strokec4 ), \strokec8 recommendations\strokec4 : \strokec8 sanitize\strokec4 (\strokec8 data\strokec4 .\strokec8 recommendations\strokec4 ), \strokec8 attachments\strokec4 : \strokec8 processAttachments\strokec4 (\strokec8 data\strokec4 .\strokec8 attachments\strokec4 ), \strokec8 lastModified\strokec4 : \cf5 \strokec5 Date\cf4 \strokec4 .\strokec8 now\strokec4 () \}, \cf9 \strokec9 0\cf4 \strokec4 ); \}\cb1 \
\cf2 \cb3 \strokec2 function\cf4 \strokec4  \strokec8 saveTakeOffItem\strokec4 (\strokec8 data\strokec4 ) \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \strokec8 appendObjectRow\strokec4 (\cf6 \strokec6 "TakeOffItems"\cf4 \strokec4 , \{\cb1 \
\cb3     \strokec8 itemId\strokec4 : \strokec8 data\strokec4 .\strokec8 itemId\strokec4 ,\cb1 \
\cb3     \strokec8 projectId\strokec4 : \strokec8 data\strokec4 .\strokec8 projectId\strokec4 ,\cb1 \
\cb3     \strokec8 roomArea\strokec4 : \strokec8 sanitize\strokec4 (\strokec8 data\strokec4 .\strokec8 roomArea\strokec4 ),\cb1 \
\cb3     \strokec8 tradeCategory\strokec4 : \strokec8 sanitize\strokec4 (\strokec8 data\strokec4 .\strokec8 tradeCategory\strokec4 ),\cb1 \
\cb3     \strokec8 description\strokec4 : \strokec8 sanitize\strokec4 (\strokec8 data\strokec4 .\strokec8 description\strokec4 ),\cb1 \
\cb3     \strokec8 quantity\strokec4 : \strokec8 data\strokec4 .\strokec8 quantity\strokec4 ,\cb1 \
\cb3     \strokec8 unit\strokec4 : \strokec8 data\strokec4 .\strokec8 unit\strokec4 ,\cb1 \
\cb3     \strokec8 beforePhotoUrl\strokec4 : \strokec8 processAttachments\strokec4 (\strokec8 data\strokec4 .\strokec8 beforePhotoUrl\strokec4 ),\cb1 \
\cb3     \strokec8 scopeNotes\strokec4 : \strokec8 sanitize\strokec4 (\strokec8 data\strokec4 .\strokec8 scopeNotes\strokec4 ),\cb1 \
\cb3     \strokec8 lastModified\strokec4 : \cf5 \strokec5 Date\cf4 \strokec4 .\strokec8 now\strokec4 ()\cb1 \
\cb3   \});\cb1 \
\cb3   \cf2 \strokec2 return\cf4 \strokec4  \{ \strokec8 success\strokec4 : \cf2 \strokec2 true\cf4 \strokec4  \};\cb1 \
\cb3 \}\cb1 \
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 function\cf4 \strokec4  \strokec8 updateTakeOffItem\strokec4 (\strokec8 data\strokec4 ) \{ \cf2 \strokec2 return\cf4 \strokec4  \strokec8 modifyRow\strokec4 (\cf6 \strokec6 "TakeOffItems"\cf4 \strokec4 , \strokec8 data\strokec4 .\strokec8 itemId\strokec4 , \{ \strokec8 roomArea\strokec4 : \strokec8 sanitize\strokec4 (\strokec8 data\strokec4 .\strokec8 roomArea\strokec4 ), \strokec8 tradeCategory\strokec4 : \strokec8 sanitize\strokec4 (\strokec8 data\strokec4 .\strokec8 tradeCategory\strokec4 ), \strokec8 description\strokec4 : \strokec8 sanitize\strokec4 (\strokec8 data\strokec4 .\strokec8 description\strokec4 ), \strokec8 quantity\strokec4 : \strokec8 data\strokec4 .\strokec8 quantity\strokec4 , \strokec8 unit\strokec4 : \strokec8 data\strokec4 .\strokec8 unit\strokec4 , \strokec8 beforePhotoUrl\strokec4 : \strokec8 processAttachments\strokec4 (\strokec8 data\strokec4 .\strokec8 beforePhotoUrl\strokec4 ), \strokec8 scopeNotes\strokec4 : \strokec8 sanitize\strokec4 (\strokec8 data\strokec4 .\strokec8 scopeNotes\strokec4 ), \strokec8 lastModified\strokec4 : \cf5 \strokec5 Date\cf4 \strokec4 .\strokec8 now\strokec4 () \}, \cf9 \strokec9 0\cf4 \strokec4 ); \}\cb1 \
\cf2 \cb3 \strokec2 function\cf4 \strokec4  \strokec8 saveProgressLog\strokec4 (\strokec8 data\strokec4 ) \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \strokec8 appendObjectRow\strokec4 (\cf6 \strokec6 "ProgressLogs"\cf4 \strokec4 , \{\cb1 \
\cb3     \strokec8 logId\strokec4 : \strokec8 data\strokec4 .\strokec8 logId\strokec4 ,\cb1 \
\cb3     \strokec8 projectId\strokec4 : \strokec8 data\strokec4 .\strokec8 projectId\strokec4 ,\cb1 \
\cb3     \strokec8 tradeCategory\strokec4 : \strokec8 sanitize\strokec4 (\strokec8 data\strokec4 .\strokec8 tradeCategory\strokec4 ),\cb1 \
\cb3     \strokec8 completionPercentage\strokec4 : \strokec8 data\strokec4 .\strokec8 completionPercentage\strokec4 ,\cb1 \
\cb3     \strokec8 commentNarrative\strokec4 : \strokec8 sanitize\strokec4 (\strokec8 data\strokec4 .\strokec8 commentNarrative\strokec4 ),\cb1 \
\cb3     \strokec8 progressPhotoUrl\strokec4 : \strokec8 processAttachments\strokec4 (\strokec8 data\strokec4 .\strokec8 progressPhotoUrl\strokec4 ),\cb1 \
\cb3     \strokec8 dateRecorded\strokec4 : \strokec8 currentDate\strokec4 (),\cb1 \
\cb3     \strokec8 lastModified\strokec4 : \cf5 \strokec5 Date\cf4 \strokec4 .\strokec8 now\strokec4 ()\cb1 \
\cb3   \});\cb1 \
\cb3   \cf2 \strokec2 return\cf4 \strokec4  \{ \strokec8 success\strokec4 : \cf2 \strokec2 true\cf4 \strokec4  \};\cb1 \
\cb3 \}\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 function\cf4 \strokec4  \strokec8 saveSnag\strokec4 (\strokec8 data\strokec4 ) \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \strokec2 const\cf4 \strokec4  \strokec8 id\strokec4  = \strokec8 data\strokec4 .\strokec8 snagId\strokec4  || (\cf6 \strokec6 "SNAG-"\cf4 \strokec4  + \cf5 \strokec5 Date\cf4 \strokec4 .\strokec8 now\strokec4 ());\cb1 \
\cb3   \strokec8 appendObjectRow\strokec4 (\cf6 \strokec6 "Snags"\cf4 \strokec4 , \{\cb1 \
\cb3     \strokec8 snagId\strokec4 : \strokec8 id\strokec4 ,\cb1 \
\cb3     \strokec8 projectId\strokec4 : \strokec8 data\strokec4 .\strokec8 projectId\strokec4 ,\cb1 \
\cb3     \strokec8 notes\strokec4 : \strokec8 sanitize\strokec4 (\strokec8 data\strokec4 .\strokec8 notes\strokec4 ),\cb1 \
\cb3     \strokec8 photoUrl\strokec4 : \cf6 \strokec6 ""\cf4 \strokec4 , \cf7 \strokec7 // intentionally left blank - snag photos are kept local-only on the device, never synced\cf4 \cb1 \strokec4 \
\cb3     \strokec8 assigned\strokec4 : \strokec8 sanitize\strokec4 (\strokec8 data\strokec4 .\strokec8 assigned\strokec4 ),\cb1 \
\cb3     \strokec8 dateLogged\strokec4 : \strokec8 data\strokec4 .\strokec8 dateLogged\strokec4  || \strokec8 currentDate\strokec4 (),\cb1 \
\cb3     \strokec8 dateCompleted\strokec4 : \strokec8 sanitize\strokec4 (\strokec8 data\strokec4 .\strokec8 dateCompleted\strokec4 ),\cb1 \
\cb3     \strokec8 status\strokec4 : \strokec8 data\strokec4 .\strokec8 status\strokec4  || \cf6 \strokec6 "Open"\cf4 \strokec4 ,\cb1 \
\cb3     \strokec8 lastModified\strokec4 : \cf5 \strokec5 Date\cf4 \strokec4 .\strokec8 now\strokec4 ()\cb1 \
\cb3   \});\cb1 \
\cb3   \cf2 \strokec2 return\cf4 \strokec4  \{ \strokec8 success\strokec4 : \cf2 \strokec2 true\cf4 \strokec4 , \strokec8 snagId\strokec4 : \strokec8 id\strokec4  \};\cb1 \
\cb3 \}\cb1 \
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 function\cf4 \strokec4  \strokec8 updateSnag\strokec4 (\strokec8 data\strokec4 ) \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \strokec2 return\cf4 \strokec4  \strokec8 modifyRow\strokec4 (\cf6 \strokec6 "Snags"\cf4 \strokec4 , \strokec8 data\strokec4 .\strokec8 snagId\strokec4 , \{\cb1 \
\cb3     \strokec8 notes\strokec4 : \strokec8 sanitize\strokec4 (\strokec8 data\strokec4 .\strokec8 notes\strokec4 ),\cb1 \
\cb3     \strokec8 assigned\strokec4 : \strokec8 sanitize\strokec4 (\strokec8 data\strokec4 .\strokec8 assigned\strokec4 ),\cb1 \
\cb3     \strokec8 dateCompleted\strokec4 : \strokec8 sanitize\strokec4 (\strokec8 data\strokec4 .\strokec8 dateCompleted\strokec4 ),\cb1 \
\cb3     \strokec8 status\strokec4 : \strokec8 data\strokec4 .\strokec8 status\strokec4 ,\cb1 \
\cb3     \strokec8 lastModified\strokec4 : \cf5 \strokec5 Date\cf4 \strokec4 .\strokec8 now\strokec4 ()\cb1 \
\cb3   \}, \cf9 \strokec9 0\cf4 \strokec4 );\cb1 \
\cb3 \}\cb1 \
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 function\cf4 \strokec4  \strokec8 saveVendor\strokec4 (\strokec8 data\strokec4 ) \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \strokec8 appendObjectRow\strokec4 (\cf6 \strokec6 "Vendors"\cf4 \strokec4 , \{\cb1 \
\cb3     \strokec8 vendorId\strokec4 : \strokec8 data\strokec4 .\strokec8 vendorId\strokec4 ,\cb1 \
\cb3     \strokec8 company\strokec4 : \strokec8 sanitize\strokec4 (\strokec8 data\strokec4 .\strokec8 company\strokec4 ),\cb1 \
\cb3     \strokec8 trade\strokec4 : \strokec8 sanitize\strokec4 (\strokec8 data\strokec4 .\strokec8 trade\strokec4 ),\cb1 \
\cb3     \strokec8 contactName\strokec4 : \strokec8 sanitize\strokec4 (\strokec8 data\strokec4 .\strokec8 contactName\strokec4 ),\cb1 \
\cb3     \strokec8 phone1\strokec4 : \cf6 \strokec6 "'"\cf4 \strokec4 +\strokec8 validatePhone\strokec4 (\strokec8 data\strokec4 .\strokec8 phone1\strokec4 ),\cb1 \
\cb3     \strokec8 phone2\strokec4 : \cf6 \strokec6 "'"\cf4 \strokec4 +\strokec8 validatePhone\strokec4 (\strokec8 data\strokec4 .\strokec8 phone2\strokec4 ),\cb1 \
\cb3     \strokec8 email\strokec4 : \strokec8 sanitize\strokec4 (\strokec8 data\strokec4 .\strokec8 email\strokec4 ),\cb1 \
\cb3     \strokec8 passport\strokec4 : \strokec8 processAttachments\strokec4 (\strokec8 data\strokec4 .\strokec8 passport\strokec4 ),\cb1 \
\cb3     \strokec8 attachments\strokec4 : \strokec8 processAttachments\strokec4 (\strokec8 data\strokec4 .\strokec8 attachments\strokec4 ),\cb1 \
\cb3     \strokec8 archived\strokec4 : \cf6 \strokec6 "No"\cf4 \strokec4 ,\cb1 \
\cb3     \strokec8 lastModified\strokec4 : \cf5 \strokec5 Date\cf4 \strokec4 .\strokec8 now\strokec4 ()\cb1 \
\cb3   \});\cb1 \
\cb3   \cf2 \strokec2 return\cf4 \strokec4  \{ \strokec8 success\strokec4 : \cf2 \strokec2 true\cf4 \strokec4  \};\cb1 \
\cb3 \}\cb1 \
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 function\cf4 \strokec4  \strokec8 updateVendor\strokec4 (\strokec8 data\strokec4 ) \{ \cf2 \strokec2 return\cf4 \strokec4  \strokec8 modifyRow\strokec4 (\cf6 \strokec6 "Vendors"\cf4 \strokec4 , \strokec8 data\strokec4 .\strokec8 vendorId\strokec4 , \{ \strokec8 company\strokec4 : \strokec8 sanitize\strokec4 (\strokec8 data\strokec4 .\strokec8 company\strokec4 ), \strokec8 trade\strokec4 : \strokec8 sanitize\strokec4 (\strokec8 data\strokec4 .\strokec8 trade\strokec4 ), \strokec8 contactName\strokec4 : \strokec8 sanitize\strokec4 (\strokec8 data\strokec4 .\strokec8 contactName\strokec4 ), \strokec8 phone1\strokec4 : \cf6 \strokec6 "'"\cf4 \strokec4 +\strokec8 validatePhone\strokec4 (\strokec8 data\strokec4 .\strokec8 phone1\strokec4 ), \strokec8 phone2\strokec4 : \cf6 \strokec6 "'"\cf4 \strokec4 +\strokec8 validatePhone\strokec4 (\strokec8 data\strokec4 .\strokec8 phone2\strokec4 ), \strokec8 email\strokec4 : \strokec8 sanitize\strokec4 (\strokec8 data\strokec4 .\strokec8 email\strokec4 ), \strokec8 passport\strokec4 : \strokec8 processAttachments\strokec4 (\strokec8 data\strokec4 .\strokec8 passport\strokec4 ), \strokec8 attachments\strokec4 : \strokec8 processAttachments\strokec4 (\strokec8 data\strokec4 .\strokec8 attachments\strokec4 ), \strokec8 lastModified\strokec4 : \cf5 \strokec5 Date\cf4 \strokec4 .\strokec8 now\strokec4 () \}, \cf9 \strokec9 0\cf4 \strokec4 ); \}\cb1 \
\cf2 \cb3 \strokec2 function\cf4 \strokec4  \strokec8 saveWorkOrder\strokec4 (\strokec8 data\strokec4 ) \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \strokec2 const\cf4 \strokec4  \strokec8 id\strokec4  = \strokec8 data\strokec4 .\strokec8 workOrderId\strokec4  || \strokec8 getNextSequentialId\strokec4 (\cf6 \strokec6 "WorkOrders"\cf4 \strokec4 , \cf6 \strokec6 "WKO/"\cf4 \strokec4  + \cf5 \strokec5 Utilities\cf4 \strokec4 .\strokec8 formatDate\strokec4 (\cf2 \strokec2 new\cf4 \strokec4  \cf5 \strokec5 Date\cf4 \strokec4 (), \cf5 \strokec5 Session\cf4 \strokec4 .\strokec8 getScriptTimeZone\strokec4 (), \cf6 \strokec6 "yy"\cf4 \strokec4 ) + \cf6 \strokec6 "/"\cf4 \strokec4 , \cf9 \strokec9 3\cf4 \strokec4 );\cb1 \
\cb3   \strokec8 appendObjectRow\strokec4 (\cf6 \strokec6 "WorkOrders"\cf4 \strokec4 , \{\cb1 \
\cb3     \strokec8 workOrderId\strokec4 : \strokec8 id\strokec4 ,\cb1 \
\cb3     \strokec8 projectId\strokec4 : \strokec8 data\strokec4 .\strokec8 projectId\strokec4 ,\cb1 \
\cb3     \strokec8 vendorId\strokec4 : \strokec8 data\strokec4 .\strokec8 vendorId\strokec4 ,\cb1 \
\cb3     \strokec8 description\strokec4 : \strokec8 sanitize\strokec4 (\strokec8 data\strokec4 .\strokec8 description\strokec4 ),\cb1 \
\cb3     \strokec8 amount\strokec4 : \cf5 \strokec5 Number\cf4 \strokec4 (\strokec8 data\strokec4 .\strokec8 amount\strokec4 ) || \cf9 \strokec9 0\cf4 \strokec4 ,\cb1 \
\cb3     \strokec8 status\strokec4 : \strokec8 data\strokec4 .\strokec8 status\strokec4 ,\cb1 \
\cb3     \strokec8 attachments\strokec4 : \strokec8 processAttachments\strokec4 (\strokec8 data\strokec4 .\strokec8 attachments\strokec4 ),\cb1 \
\cb3     \strokec8 dateCreated\strokec4 : \strokec8 currentDate\strokec4 (),\cb1 \
\cb3     \strokec8 lastModified\strokec4 : \cf5 \strokec5 Date\cf4 \strokec4 .\strokec8 now\strokec4 ()\cb1 \
\cb3   \});\cb1 \
\cb3   \cf2 \strokec2 return\cf4 \strokec4  \{ \strokec8 success\strokec4 : \cf2 \strokec2 true\cf4 \strokec4  \};\cb1 \
\cb3 \}\cb1 \
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 function\cf4 \strokec4  \strokec8 updateWorkOrder\strokec4 (\strokec8 data\strokec4 ) \{ \cf2 \strokec2 return\cf4 \strokec4  \strokec8 modifyRow\strokec4 (\cf6 \strokec6 "WorkOrders"\cf4 \strokec4 , \strokec8 data\strokec4 .\strokec8 workOrderId\strokec4 , \{ \strokec8 vendorId\strokec4 : \strokec8 data\strokec4 .\strokec8 vendorId\strokec4 , \strokec8 description\strokec4 : \strokec8 sanitize\strokec4 (\strokec8 data\strokec4 .\strokec8 description\strokec4 ), \strokec8 amount\strokec4 : \cf5 \strokec5 Number\cf4 \strokec4 (\strokec8 data\strokec4 .\strokec8 amount\strokec4 )||\cf9 \strokec9 0\cf4 \strokec4 , \strokec8 status\strokec4 : \strokec8 data\strokec4 .\strokec8 status\strokec4 , \strokec8 attachments\strokec4 : \strokec8 processAttachments\strokec4 (\strokec8 data\strokec4 .\strokec8 attachments\strokec4 ), \strokec8 lastModified\strokec4 : \cf5 \strokec5 Date\cf4 \strokec4 .\strokec8 now\strokec4 () \}, \cf9 \strokec9 0\cf4 \strokec4 ); \}\cb1 \
\cf2 \cb3 \strokec2 function\cf4 \strokec4  \strokec8 savePayment\strokec4 (\strokec8 data\strokec4 ) \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \strokec2 let\cf4 \strokec4  \strokec8 id\strokec4  = \strokec8 data\strokec4 .\strokec8 paymentId\strokec4 ;\cb1 \
\cb3   \cf2 \strokec2 if\cf4 \strokec4  (!\strokec8 id\strokec4  || \strokec8 id\strokec4 .\strokec8 startsWith\strokec4 (\cf6 \strokec6 "PAY-"\cf4 \strokec4 )) \strokec8 id\strokec4  = \strokec8 getNextSequentialPaymentId\strokec4 (\strokec8 data\strokec4 .\strokec8 projectId\strokec4 );\cb1 \
\cb3   \strokec8 appendObjectRow\strokec4 (\cf6 \strokec6 "Payments"\cf4 \strokec4 , \{\cb1 \
\cb3     \strokec8 paymentId\strokec4 : \strokec8 id\strokec4 ,\cb1 \
\cb3     \strokec8 projectId\strokec4 : \strokec8 data\strokec4 .\strokec8 projectId\strokec4 ,\cb1 \
\cb3     \strokec8 paymentDate\strokec4 : \strokec8 data\strokec4 .\strokec8 paymentDate\strokec4  || \strokec8 currentDate\strokec4 (),\cb1 \
\cb3     \strokec8 paymentDirection\strokec4 : \strokec8 data\strokec4 .\strokec8 paymentDirection\strokec4 ,\cb1 \
\cb3     \strokec8 payee\strokec4 : \strokec8 sanitize\strokec4 (\strokec8 data\strokec4 .\strokec8 payee\strokec4 ),\cb1 \
\cb3     \strokec8 expenseCategory\strokec4 : \strokec8 sanitize\strokec4 (\strokec8 data\strokec4 .\strokec8 expenseCategory\strokec4 ),\cb1 \
\cb3     \strokec8 referenceId\strokec4 : \strokec8 sanitize\strokec4 (\strokec8 data\strokec4 .\strokec8 referenceId\strokec4 ),\cb1 \
\cb3     \strokec8 amount\strokec4 : \cf5 \strokec5 Number\cf4 \strokec4 (\strokec8 data\strokec4 .\strokec8 amount\strokec4 ) || \cf9 \strokec9 0\cf4 \strokec4 ,\cb1 \
\cb3     \strokec8 paymentMethod\strokec4 : \strokec8 data\strokec4 .\strokec8 paymentMethod\strokec4 ,\cb1 \
\cb3     \strokec8 status\strokec4 : \strokec8 data\strokec4 .\strokec8 status\strokec4 ,\cb1 \
\cb3     \strokec8 notes\strokec4 : \strokec8 sanitize\strokec4 (\strokec8 data\strokec4 .\strokec8 notes\strokec4 ),\cb1 \
\cb3     \strokec8 attachments\strokec4 : \strokec8 processAttachments\strokec4 (\strokec8 data\strokec4 .\strokec8 attachments\strokec4 ),\cb1 \
\cb3     \strokec8 lastModified\strokec4 : \cf5 \strokec5 Date\cf4 \strokec4 .\strokec8 now\strokec4 ()\cb1 \
\cb3   \});\cb1 \
\cb3   \cf2 \strokec2 return\cf4 \strokec4  \{ \strokec8 success\strokec4 : \cf2 \strokec2 true\cf4 \strokec4 , \strokec8 paymentId\strokec4 : \strokec8 id\strokec4  \};\cb1 \
\cb3 \}\cb1 \
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 function\cf4 \strokec4  \strokec8 updatePayment\strokec4 (\strokec8 data\strokec4 ) \{ \cf2 \strokec2 return\cf4 \strokec4  \strokec8 modifyRow\strokec4 (\cf6 \strokec6 "Payments"\cf4 \strokec4 , \strokec8 data\strokec4 .\strokec8 paymentId\strokec4 , \{ \strokec8 paymentDate\strokec4 : \strokec8 data\strokec4 .\strokec8 paymentDate\strokec4 , \strokec8 paymentDirection\strokec4 : \strokec8 data\strokec4 .\strokec8 paymentDirection\strokec4 , \strokec8 payee\strokec4 : \strokec8 sanitize\strokec4 (\strokec8 data\strokec4 .\strokec8 payee\strokec4 ), \strokec8 expenseCategory\strokec4 : \strokec8 sanitize\strokec4 (\strokec8 data\strokec4 .\strokec8 expenseCategory\strokec4 ), \strokec8 referenceId\strokec4 : \strokec8 sanitize\strokec4 (\strokec8 data\strokec4 .\strokec8 referenceId\strokec4 ), \strokec8 amount\strokec4 : \cf5 \strokec5 Number\cf4 \strokec4 (\strokec8 data\strokec4 .\strokec8 amount\strokec4 )||\cf9 \strokec9 0\cf4 \strokec4 , \strokec8 paymentMethod\strokec4 : \strokec8 data\strokec4 .\strokec8 paymentMethod\strokec4 , \strokec8 status\strokec4 : \strokec8 data\strokec4 .\strokec8 status\strokec4 , \strokec8 notes\strokec4 : \strokec8 sanitize\strokec4 (\strokec8 data\strokec4 .\strokec8 notes\strokec4 ), \strokec8 attachments\strokec4 : \strokec8 processAttachments\strokec4 (\strokec8 data\strokec4 .\strokec8 attachments\strokec4 ), \strokec8 lastModified\strokec4 : \cf5 \strokec5 Date\cf4 \strokec4 .\strokec8 now\strokec4 () \}, \cf9 \strokec9 0\cf4 \strokec4 ); \}\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf7 \cb3 \strokec7 // Extracts the last 3 digits of a project ID, e.g. "PRJ/26/001" -> "001"\cf4 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 function\cf4 \strokec4  \strokec8 projectNumberSuffix\strokec4 (\strokec8 projectId\strokec4 ) \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \strokec2 const\cf4 \strokec4  \strokec8 match\strokec4  = \cf5 \strokec5 String\cf4 \strokec4 (\strokec8 projectId\strokec4  || \cf6 \strokec6 ""\cf4 \strokec4 ).\strokec8 match\strokec4 (\cf10 \strokec10 /(\\d\{1,3\})\\D*$/\cf4 \strokec4 );\cb1 \
\cb3   \cf2 \strokec2 if\cf4 \strokec4  (\strokec8 match\strokec4 ) \cf2 \strokec2 return\cf4 \strokec4  \strokec8 match\strokec4 [\cf9 \strokec9 1\cf4 \strokec4 ].\strokec8 padStart\strokec4 (\cf9 \strokec9 3\cf4 \strokec4 , \cf6 \strokec6 '0'\cf4 \strokec4 ).\strokec8 slice\strokec4 (-\cf9 \strokec9 3\cf4 \strokec4 );\cb1 \
\cb3   \cf2 \strokec2 return\cf4 \strokec4  \cf6 \strokec6 "000"\cf4 \strokec4 ;\cb1 \
\cb3 \}\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 function\cf4 \strokec4  \strokec8 getNextSequentialPaymentId\strokec4 (\strokec8 projectId\strokec4 ) \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \strokec2 const\cf4 \strokec4  \strokec8 lock\strokec4  = \cf5 \strokec5 LockService\cf4 \strokec4 .\strokec8 getScriptLock\strokec4 ();\cb1 \
\cb3   \strokec8 lock\strokec4 .\strokec8 waitLock\strokec4 (\cf9 \strokec9 10000\cf4 \strokec4 );\cb1 \
\cb3   \cf2 \strokec2 try\cf4 \strokec4  \{\cb1 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  \strokec8 prefix\strokec4  = \strokec8 projectNumberSuffix\strokec4 (\strokec8 projectId\strokec4 ) + \cf6 \strokec6 "-"\cf4 \strokec4 ;\cb1 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  \strokec8 sheet\strokec4  = \strokec8 ensureSheet\strokec4 (\cf6 \strokec6 "Payments"\cf4 \strokec4 );\cb1 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  \strokec8 data\strokec4  = \strokec8 sheet\strokec4 .\strokec8 getDataRange\strokec4 ().\strokec8 getValues\strokec4 ();\cb1 \
\cb3     \cf2 \strokec2 let\cf4 \strokec4  \strokec8 max\strokec4  = \cf9 \strokec9 0\cf4 \strokec4 ;\cb1 \
\cb3     \cf2 \strokec2 for\cf4 \strokec4  (\cf2 \strokec2 let\cf4 \strokec4  \strokec8 i\strokec4 =\cf9 \strokec9 1\cf4 \strokec4 ; \strokec8 i\strokec4 <\strokec8 data\strokec4 .\strokec8 length\strokec4 ; \strokec8 i\strokec4 ++) \{\cb1 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  \strokec8 id\strokec4  = \cf5 \strokec5 String\cf4 \strokec4 (\strokec8 data\strokec4 [\strokec8 i\strokec4 ][\cf9 \strokec9 0\cf4 \strokec4 ]);\cb1 \
\cb3       \cf2 \strokec2 if\cf4 \strokec4  (\strokec8 id\strokec4 .\strokec8 startsWith\strokec4 (\strokec8 prefix\strokec4 )) \{\cb1 \
\cb3         \cf2 \strokec2 const\cf4 \strokec4  \strokec8 num\strokec4  = \strokec8 parseInt\strokec4 (\strokec8 id\strokec4 .\strokec8 substring\strokec4 (\strokec8 prefix\strokec4 .\strokec8 length\strokec4 ));\cb1 \
\cb3         \cf2 \strokec2 if\cf4 \strokec4  (!\strokec8 isNaN\strokec4 (\strokec8 num\strokec4 ) && \strokec8 num\strokec4  > \strokec8 max\strokec4 ) \strokec8 max\strokec4  = \strokec8 num\strokec4 ;\cb1 \
\cb3       \}\cb1 \
\cb3     \}\cb1 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  \strokec8 next\strokec4  = \strokec8 max\strokec4  + \cf9 \strokec9 1\cf4 \strokec4 ;\cb1 \
\cb3     \cf2 \strokec2 return\cf4 \strokec4  \strokec8 prefix\strokec4  + \cf5 \strokec5 String\cf4 \strokec4 (\strokec8 next\strokec4 ).\strokec8 padStart\strokec4 (\cf9 \strokec9 2\cf4 \strokec4 , \cf6 \strokec6 '0'\cf4 \strokec4 );\cb1 \
\cb3   \} \cf2 \strokec2 finally\cf4 \strokec4  \{\cb1 \
\cb3     \strokec8 lock\strokec4 .\strokec8 releaseLock\strokec4 ();\cb1 \
\cb3   \}\cb1 \
\cb3 \}\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 function\cf4 \strokec4  \strokec8 processAttachments\strokec4 (\strokec8 raw\strokec4 ) \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \strokec2 if\cf4 \strokec4  (!\strokec8 raw\strokec4 ) \cf2 \strokec2 return\cf4 \strokec4  \cf6 \strokec6 ""\cf4 \strokec4 ;\cb1 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  \strokec8 items\strokec4  = \cf5 \strokec5 String\cf4 \strokec4 (\strokec8 raw\strokec4 ).\strokec8 split\strokec4 (\cf6 \strokec6 "|||"\cf4 \strokec4 );\cb1 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  \strokec8 processed\strokec4  = \strokec8 items\strokec4 .\strokec8 map\strokec4 (\strokec8 item\strokec4  => \{\cb1 \
\cb3     \cf2 \strokec2 if\cf4 \strokec4  (\strokec8 item\strokec4 .\strokec8 startsWith\strokec4 (\cf6 \strokec6 "data:"\cf4 \strokec4 )) \{\cb1 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  \strokec8 ext\strokec4  = \strokec8 item\strokec4 .\strokec8 includes\strokec4 (\cf6 \strokec6 "application/pdf"\cf4 \strokec4 ) ? \cf6 \strokec6 "pdf"\cf4 \strokec4  : \cf6 \strokec6 "jpg"\cf4 \strokec4 ;\cb1 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  \strokec8 fileName\strokec4  = \cf6 \strokec6 "img_"\cf4 \strokec4  + \cf5 \strokec5 Date\cf4 \strokec4 .\strokec8 now\strokec4 () + \cf6 \strokec6 "_"\cf4 \strokec4  + \cf5 \strokec5 Math\cf4 \strokec4 .\strokec8 random\strokec4 ().\strokec8 toString\strokec4 (\cf9 \strokec9 36\cf4 \strokec4 ) + \cf6 \strokec6 "."\cf4 \strokec4  + \strokec8 ext\strokec4 ;\cb1 \
\cb3       \cf2 \strokec2 return\cf4 \strokec4  \strokec8 uploadImageToDrive\strokec4 (\strokec8 item\strokec4 , \strokec8 fileName\strokec4 );\cb1 \
\cb3     \}\cb1 \
\cb3     \cf2 \strokec2 return\cf4 \strokec4  \strokec8 item\strokec4 ;\cb1 \
\cb3   \}).\strokec8 filter\strokec4 (\cf5 \strokec5 Boolean\cf4 \strokec4 );\cb1 \
\cb3   \cf2 \strokec2 return\cf4 \strokec4  \strokec8 processed\strokec4 .\strokec8 join\strokec4 (\cf6 \strokec6 "|||"\cf4 \strokec4 );\cb1 \
\cb3 \}\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 function\cf4 \strokec4  \strokec8 uploadImageToDrive\strokec4 (\strokec8 base64\strokec4 , \strokec8 fileName\strokec4 ) \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \strokec2 try\cf4 \strokec4  \{\cb1 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  \strokec8 folderName\strokec4  = \cf6 \strokec6 "FieldScan_Files"\cf4 \strokec4 ;\cb1 \
\cb3     \cf2 \strokec2 let\cf4 \strokec4  \strokec8 folder\strokec4  = \cf5 \strokec5 DriveApp\cf4 \strokec4 .\strokec8 getFoldersByName\strokec4 (\strokec8 folderName\strokec4 ).\strokec8 hasNext\strokec4 () ? \cf5 \strokec5 DriveApp\cf4 \strokec4 .\strokec8 getFoldersByName\strokec4 (\strokec8 folderName\strokec4 ).\strokec8 next\strokec4 () : \cf5 \strokec5 DriveApp\cf4 \strokec4 .\strokec8 createFolder\strokec4 (\strokec8 folderName\strokec4 );\cb1 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  \strokec8 parts\strokec4  = \strokec8 base64\strokec4 .\strokec8 split\strokec4 (\cf6 \strokec6 ","\cf4 \strokec4 );\cb1 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  \strokec8 blob\strokec4  = \cf5 \strokec5 Utilities\cf4 \strokec4 .\strokec8 newBlob\strokec4 (\cf5 \strokec5 Utilities\cf4 \strokec4 .\strokec8 base64Decode\strokec4 (\strokec8 parts\strokec4 [\cf9 \strokec9 1\cf4 \strokec4 ]), \strokec8 parts\strokec4 [\cf9 \strokec9 0\cf4 \strokec4 ].\strokec8 split\strokec4 (\cf6 \strokec6 ":"\cf4 \strokec4 )[\cf9 \strokec9 1\cf4 \strokec4 ].\strokec8 split\strokec4 (\cf6 \strokec6 ";"\cf4 \strokec4 )[\cf9 \strokec9 0\cf4 \strokec4 ], \strokec8 fileName\strokec4 );\cb1 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  \strokec8 file\strokec4  = \strokec8 folder\strokec4 .\strokec8 createFile\strokec4 (\strokec8 blob\strokec4 );\cb1 \
\cb3     \strokec8 file\strokec4 .\strokec8 setSharing\strokec4 (\cf5 \strokec5 DriveApp\cf4 \strokec4 .\cf5 \strokec5 Access\cf4 \strokec4 .\cf5 \strokec5 PRIVATE\cf4 \strokec4 , \cf5 \strokec5 DriveApp\cf4 \strokec4 .\cf5 \strokec5 Permission\cf4 \strokec4 .\cf5 \strokec5 NONE\cf4 \strokec4 );\cb1 \
\cb3     \cf2 \strokec2 return\cf4 \strokec4  \strokec8 file\strokec4 .\strokec8 getId\strokec4 (); \cf7 \strokec7 // store ID, not public URL\cf4 \cb1 \strokec4 \
\cb3   \} \cf2 \strokec2 catch\cf4 \strokec4 (\strokec8 e\strokec4 ) \{ \cf2 \strokec2 return\cf4 \strokec4  \cf6 \strokec6 ""\cf4 \strokec4 ; \}\cb1 \
\cb3 \}\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 function\cf4 \strokec4  \strokec8 getActiveVendorsCount\strokec4 () \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \strokec2 const\cf4 \strokec4  \strokec8 sheet\strokec4  = \strokec8 ensureSheet\strokec4 (\cf6 \strokec6 "Vendors"\cf4 \strokec4 );\cb1 \
\cb3   \cf2 \strokec2 if\cf4 \strokec4  (\strokec8 sheet\strokec4 .\strokec8 getLastRow\strokec4 () <= \cf9 \strokec9 1\cf4 \strokec4 ) \cf2 \strokec2 return\cf4 \strokec4  \cf9 \strokec9 0\cf4 \strokec4 ;\cb1 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  \strokec8 data\strokec4  = \strokec8 sheet\strokec4 .\strokec8 getRange\strokec4 (\cf9 \strokec9 2\cf4 \strokec4 , \cf9 \strokec9 10\cf4 \strokec4 , \strokec8 sheet\strokec4 .\strokec8 getLastRow\strokec4 ()-\cf9 \strokec9 1\cf4 \strokec4 , \cf9 \strokec9 1\cf4 \strokec4 ).\strokec8 getValues\strokec4 (); \cf7 \strokec7 // column "archived"\cf4 \cb1 \strokec4 \
\cb3   \cf2 \strokec2 return\cf4 \strokec4  \strokec8 data\strokec4 .\strokec8 filter\strokec4 (\strokec8 r\strokec4  => \strokec8 r\strokec4 [\cf9 \strokec9 0\cf4 \strokec4 ] !== \cf6 \strokec6 "Yes"\cf4 \strokec4 ).\strokec8 length\strokec4 ;\cb1 \
\cb3 \}\cb1 \
\
\pard\pardeftab720\partightenfactor0
\cf7 \cb3 \strokec7 // ======================== SHEET HELPERS ========================\cf4 \cb1 \strokec4 \
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 function\cf4 \strokec4  \strokec8 ensureSheet\strokec4 (\strokec8 name\strokec4 ) \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \strokec2 const\cf4 \strokec4  \strokec8 ss\strokec4  = \cf5 \strokec5 SpreadsheetApp\cf4 \strokec4 .\strokec8 getActiveSpreadsheet\strokec4 ();\cb1 \
\cb3   \cf2 \strokec2 let\cf4 \strokec4  \strokec8 sheet\strokec4  = \strokec8 ss\strokec4 .\strokec8 getSheetByName\strokec4 (\strokec8 name\strokec4 );\cb1 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  \strokec8 schema\strokec4  = \cf5 \strokec5 SHEET_SCHEMAS\cf4 \strokec4 [\strokec8 name\strokec4 ];\cb1 \
\cb3   \cf2 \strokec2 if\cf4 \strokec4  (!\strokec8 sheet\strokec4 ) \{ \strokec8 sheet\strokec4  = \strokec8 ss\strokec4 .\strokec8 insertSheet\strokec4 (\strokec8 name\strokec4 ); \strokec8 sheet\strokec4 .\strokec8 appendRow\strokec4 (\strokec8 schema\strokec4 ); \cf2 \strokec2 return\cf4 \strokec4  \strokec8 sheet\strokec4 ; \}\cb1 \
\cb3   \cf2 \strokec2 let\cf4 \strokec4  \strokec8 headers\strokec4  = \strokec8 sheet\strokec4 .\strokec8 getRange\strokec4 (\cf9 \strokec9 1\cf4 \strokec4 ,\cf9 \strokec9 1\cf4 \strokec4 ,\cf9 \strokec9 1\cf4 \strokec4 ,\strokec8 sheet\strokec4 .\strokec8 getLastColumn\strokec4 ()).\strokec8 getValues\strokec4 ()[\cf9 \strokec9 0\cf4 \strokec4 ].\strokec8 map\strokec4 (\strokec8 normalizeHeader\strokec4 );\cb1 \
\cb3   \strokec8 schema\strokec4 .\strokec8 forEach\strokec4 (\strokec8 h\strokec4  => \{\cb1 \
\cb3     \cf2 \strokec2 if\cf4 \strokec4  (!\strokec8 headers\strokec4 .\strokec8 includes\strokec4 (\strokec8 normalizeHeader\strokec4 (\strokec8 h\strokec4 ))) \{\cb1 \
\cb3       \strokec8 sheet\strokec4 .\strokec8 getRange\strokec4 (\cf9 \strokec9 1\cf4 \strokec4 , \strokec8 sheet\strokec4 .\strokec8 getLastColumn\strokec4 ()+\cf9 \strokec9 1\cf4 \strokec4 ).\strokec8 setValue\strokec4 (\strokec8 h\strokec4 );\cb1 \
\cb3       \strokec8 headers\strokec4 .\strokec8 push\strokec4 (\strokec8 normalizeHeader\strokec4 (\strokec8 h\strokec4 )); \cf7 \strokec7 // keep headers in sync so we don't re-add the same column twice\cf4 \cb1 \strokec4 \
\cb3     \}\cb1 \
\cb3   \});\cb1 \
\cb3   \cf2 \strokec2 if\cf4 \strokec4  (!\strokec8 headers\strokec4 .\strokec8 includes\strokec4 (\strokec8 normalizeHeader\strokec4 (\cf6 \strokec6 "lastModified"\cf4 \strokec4 ))) \{\cb1 \
\cb3     \strokec8 sheet\strokec4 .\strokec8 getRange\strokec4 (\cf9 \strokec9 1\cf4 \strokec4 , \strokec8 sheet\strokec4 .\strokec8 getLastColumn\strokec4 ()+\cf9 \strokec9 1\cf4 \strokec4 ).\strokec8 setValue\strokec4 (\cf6 \strokec6 "lastModified"\cf4 \strokec4 );\cb1 \
\cb3   \}\cb1 \
\cb3   \cf2 \strokec2 return\cf4 \strokec4  \strokec8 sheet\strokec4 ;\cb1 \
\cb3 \}\cb1 \
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 function\cf4 \strokec4  \strokec8 appendRow\strokec4 (\strokec8 sheetName\strokec4 , \strokec8 row\strokec4 ) \{ \strokec8 ensureSheet\strokec4 (\strokec8 sheetName\strokec4 ).\strokec8 appendRow\strokec4 (\strokec8 row\strokec4 ); \}\cb1 \
\cf2 \cb3 \strokec2 function\cf4 \strokec4  \strokec8 appendObjectRow\strokec4 (\strokec8 sheetName\strokec4 , \strokec8 values\strokec4 ) \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \strokec2 const\cf4 \strokec4  \strokec8 sheet\strokec4  = \strokec8 ensureSheet\strokec4 (\strokec8 sheetName\strokec4 );\cb1 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  \strokec8 headers\strokec4  = \strokec8 sheet\strokec4 .\strokec8 getRange\strokec4 (\cf9 \strokec9 1\cf4 \strokec4 ,\cf9 \strokec9 1\cf4 \strokec4 ,\cf9 \strokec9 1\cf4 \strokec4 ,\strokec8 sheet\strokec4 .\strokec8 getLastColumn\strokec4 ()).\strokec8 getValues\strokec4 ()[\cf9 \strokec9 0\cf4 \strokec4 ];\cb1 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  \strokec8 row\strokec4  = \strokec8 headers\strokec4 .\strokec8 map\strokec4 (\strokec8 header\strokec4  => \{\cb1 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  \strokec8 key\strokec4  = \cf5 \strokec5 Object\cf4 \strokec4 .\strokec8 keys\strokec4 (\strokec8 values\strokec4 ).\strokec8 find\strokec4 (\strokec8 k\strokec4  => \strokec8 normalizeHeader\strokec4 (\strokec8 k\strokec4 ) === \strokec8 normalizeHeader\strokec4 (\strokec8 header\strokec4 ));\cb1 \
\cb3     \cf2 \strokec2 return\cf4 \strokec4  \strokec8 key\strokec4  ? \strokec8 values\strokec4 [\strokec8 key\strokec4 ] : \cf6 \strokec6 ""\cf4 \strokec4 ;\cb1 \
\cb3   \});\cb1 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  \strokec8 newRowNum\strokec4  = \strokec8 sheet\strokec4 .\strokec8 getLastRow\strokec4 () + \cf9 \strokec9 1\cf4 \strokec4 ;\cb1 \
\cb3   \cf7 \strokec7 // Force plain-text format on date-shaped columns before writing, so Sheets doesn't\cf4 \cb1 \strokec4 \
\cb3   \cf7 \strokec7 // auto-convert "2026/06/16" strings into Date objects.\cf4 \cb1 \strokec4 \
\cb3   \strokec8 headers\strokec4 .\strokec8 forEach\strokec4 ((\strokec8 header\strokec4 , \strokec8 idx\strokec4 ) => \{\cb1 \
\cb3     \cf2 \strokec2 if\cf4 \strokec4  (\cf10 \strokec10 /date/\cf2 \strokec2 i\cf4 \strokec4 .\strokec8 test\strokec4 (\strokec8 header\strokec4 )) \strokec8 sheet\strokec4 .\strokec8 getRange\strokec4 (\strokec8 newRowNum\strokec4 , \strokec8 idx\strokec4 +\cf9 \strokec9 1\cf4 \strokec4 ).\strokec8 setNumberFormat\strokec4 (\cf6 \strokec6 "@"\cf4 \strokec4 );\cb1 \
\cb3   \});\cb1 \
\cb3   \strokec8 sheet\strokec4 .\strokec8 getRange\strokec4 (\strokec8 newRowNum\strokec4 , \cf9 \strokec9 1\cf4 \strokec4 , \cf9 \strokec9 1\cf4 \strokec4 , \strokec8 row\strokec4 .\strokec8 length\strokec4 ).\strokec8 setValues\strokec4 ([\strokec8 row\strokec4 ]);\cb1 \
\cb3 \}\cb1 \
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 function\cf4 \strokec4  \strokec8 modifyRow\strokec4 (\strokec8 sheetName\strokec4 , \strokec8 id\strokec4 , \strokec8 updates\strokec4 , \strokec8 idCol\strokec4 =\cf9 \strokec9 0\cf4 \strokec4 ) \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \strokec2 const\cf4 \strokec4  \strokec8 sheet\strokec4  = \strokec8 ensureSheet\strokec4 (\strokec8 sheetName\strokec4 );\cb1 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  \strokec8 data\strokec4  = \strokec8 sheet\strokec4 .\strokec8 getDataRange\strokec4 ().\strokec8 getValues\strokec4 ();\cb1 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  \strokec8 headers\strokec4  = \strokec8 data\strokec4 [\cf9 \strokec9 0\cf4 \strokec4 ].\strokec8 map\strokec4 (\strokec8 normalizeHeader\strokec4 );\cb1 \
\cb3   \cf2 \strokec2 for\cf4 \strokec4  (\cf2 \strokec2 let\cf4 \strokec4  \strokec8 i\strokec4 =\cf9 \strokec9 1\cf4 \strokec4 ; \strokec8 i\strokec4 <\strokec8 data\strokec4 .\strokec8 length\strokec4 ; \strokec8 i\strokec4 ++) \{\cb1 \
\cb3     \cf2 \strokec2 if\cf4 \strokec4  (\cf5 \strokec5 String\cf4 \strokec4 (\strokec8 data\strokec4 [\strokec8 i\strokec4 ][\strokec8 idCol\strokec4 ]).\strokec8 trim\strokec4 () === \cf5 \strokec5 String\cf4 \strokec4 (\strokec8 id\strokec4 ).\strokec8 trim\strokec4 ()) \{\cb1 \
\cb3       \cf7 \strokec7 // conflict detection: if incoming lastModified is older, reject\cf4 \cb1 \strokec4 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  \strokec8 existingLastMod\strokec4  = \strokec8 data\strokec4 [\strokec8 i\strokec4 ][\strokec8 headers\strokec4 .\strokec8 indexOf\strokec4 (\strokec8 normalizeHeader\strokec4 (\cf6 \strokec6 "lastModified"\cf4 \strokec4 ))];\cb1 \
\cb3       \cf2 \strokec2 if\cf4 \strokec4  (\strokec8 updates\strokec4 .\strokec8 lastModified\strokec4  && \strokec8 existingLastMod\strokec4  && \cf5 \strokec5 Number\cf4 \strokec4 (\strokec8 updates\strokec4 .\strokec8 lastModified\strokec4 ) < \cf5 \strokec5 Number\cf4 \strokec4 (\strokec8 existingLastMod\strokec4 )) \{\cb1 \
\cb3         \cf2 \strokec2 return\cf4 \strokec4  \{ \strokec8 success\strokec4 : \cf2 \strokec2 false\cf4 \strokec4 , \strokec8 error\strokec4 : \cf6 \strokec6 "Conflict: server has newer version"\cf4 \strokec4  \};\cb1 \
\cb3       \}\cb1 \
\cb3       \cf2 \strokec2 for\cf4 \strokec4  (\cf2 \strokec2 let\cf4 \strokec4  [\strokec8 k\strokec4 ,\strokec8 v\strokec4 ] \cf2 \strokec2 of\cf4 \strokec4  \cf5 \strokec5 Object\cf4 \strokec4 .\strokec8 entries\strokec4 (\strokec8 updates\strokec4 )) \{\cb1 \
\cb3         \cf2 \strokec2 const\cf4 \strokec4  \strokec8 col\strokec4  = \strokec8 headers\strokec4 .\strokec8 indexOf\strokec4 (\strokec8 normalizeHeader\strokec4 (\strokec8 k\strokec4 ));\cb1 \
\cb3         \cf2 \strokec2 if\cf4 \strokec4  (\strokec8 col\strokec4  !== -\cf9 \strokec9 1\cf4 \strokec4 ) \{\cb1 \
\cb3           \cf2 \strokec2 if\cf4 \strokec4  (\cf10 \strokec10 /date/\cf2 \strokec2 i\cf4 \strokec4 .\strokec8 test\strokec4 (\strokec8 k\strokec4 )) \strokec8 sheet\strokec4 .\strokec8 getRange\strokec4 (\strokec8 i\strokec4 +\cf9 \strokec9 1\cf4 \strokec4 , \strokec8 col\strokec4 +\cf9 \strokec9 1\cf4 \strokec4 ).\strokec8 setNumberFormat\strokec4 (\cf6 \strokec6 "@"\cf4 \strokec4 );\cb1 \
\cb3           \strokec8 sheet\strokec4 .\strokec8 getRange\strokec4 (\strokec8 i\strokec4 +\cf9 \strokec9 1\cf4 \strokec4 , \strokec8 col\strokec4 +\cf9 \strokec9 1\cf4 \strokec4 ).\strokec8 setValue\strokec4 (\strokec8 v\strokec4 );\cb1 \
\cb3         \}\cb1 \
\cb3       \}\cb1 \
\cb3       \cf2 \strokec2 return\cf4 \strokec4  \{ \strokec8 success\strokec4 : \cf2 \strokec2 true\cf4 \strokec4  \};\cb1 \
\cb3     \}\cb1 \
\cb3   \}\cb1 \
\cb3   \cf2 \strokec2 return\cf4 \strokec4  \{ \strokec8 success\strokec4 : \cf2 \strokec2 false\cf4 \strokec4 , \strokec8 error\strokec4 : \cf6 \strokec6 "Not found"\cf4 \strokec4  \};\cb1 \
\cb3 \}\cb1 \
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 function\cf4 \strokec4  \strokec8 deleteRow\strokec4 (\strokec8 sheetName\strokec4 , \strokec8 id\strokec4 , \strokec8 idCol\strokec4 =\cf9 \strokec9 0\cf4 \strokec4 ) \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \strokec2 const\cf4 \strokec4  \strokec8 sheet\strokec4  = \strokec8 ensureSheet\strokec4 (\strokec8 sheetName\strokec4 );\cb1 \
\cb3   \cf2 \strokec2 const\cf4 \strokec4  \strokec8 data\strokec4  = \strokec8 sheet\strokec4 .\strokec8 getDataRange\strokec4 ().\strokec8 getValues\strokec4 ();\cb1 \
\cb3   \cf2 \strokec2 for\cf4 \strokec4  (\cf2 \strokec2 let\cf4 \strokec4  \strokec8 i\strokec4 =\cf9 \strokec9 1\cf4 \strokec4 ; \strokec8 i\strokec4 <\strokec8 data\strokec4 .\strokec8 length\strokec4 ; \strokec8 i\strokec4 ++) \{\cb1 \
\cb3     \cf2 \strokec2 if\cf4 \strokec4  (\cf5 \strokec5 String\cf4 \strokec4 (\strokec8 data\strokec4 [\strokec8 i\strokec4 ][\strokec8 idCol\strokec4 ]).\strokec8 trim\strokec4 () === \cf5 \strokec5 String\cf4 \strokec4 (\strokec8 id\strokec4 ).\strokec8 trim\strokec4 ()) \{ \strokec8 sheet\strokec4 .\strokec8 deleteRow\strokec4 (\strokec8 i\strokec4 +\cf9 \strokec9 1\cf4 \strokec4 ); \cf2 \strokec2 return\cf4 \strokec4  \{ \strokec8 success\strokec4 : \cf2 \strokec2 true\cf4 \strokec4  \}; \}\cb1 \
\cb3   \}\cb1 \
\cb3   \cf2 \strokec2 return\cf4 \strokec4  \{ \strokec8 success\strokec4 : \cf2 \strokec2 false\cf4 \strokec4  \};\cb1 \
\cb3 \}\cb1 \
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 function\cf4 \strokec4  \strokec8 getNextSequentialId\strokec4 (\strokec8 sheetName\strokec4 , \strokec8 prefix\strokec4 , \strokec8 pad\strokec4 ) \{\cb1 \
\pard\pardeftab720\partightenfactor0
\cf4 \cb3   \cf2 \strokec2 const\cf4 \strokec4  \strokec8 lock\strokec4  = \cf5 \strokec5 LockService\cf4 \strokec4 .\strokec8 getScriptLock\strokec4 ();\cb1 \
\cb3   \strokec8 lock\strokec4 .\strokec8 waitLock\strokec4 (\cf9 \strokec9 10000\cf4 \strokec4 );\cb1 \
\cb3   \cf2 \strokec2 try\cf4 \strokec4  \{\cb1 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  \strokec8 sheet\strokec4  = \strokec8 ensureSheet\strokec4 (\strokec8 sheetName\strokec4 );\cb1 \
\cb3     \cf2 \strokec2 const\cf4 \strokec4  \strokec8 data\strokec4  = \strokec8 sheet\strokec4 .\strokec8 getDataRange\strokec4 ().\strokec8 getValues\strokec4 ();\cb1 \
\cb3     \cf2 \strokec2 let\cf4 \strokec4  \strokec8 max\strokec4  = \cf9 \strokec9 0\cf4 \strokec4 ;\cb1 \
\cb3     \cf2 \strokec2 for\cf4 \strokec4  (\cf2 \strokec2 let\cf4 \strokec4  \strokec8 i\strokec4 =\cf9 \strokec9 1\cf4 \strokec4 ; \strokec8 i\strokec4 <\strokec8 data\strokec4 .\strokec8 length\strokec4 ; \strokec8 i\strokec4 ++) \{\cb1 \
\cb3       \cf2 \strokec2 const\cf4 \strokec4  \strokec8 cell\strokec4  = \cf5 \strokec5 String\cf4 \strokec4 (\strokec8 data\strokec4 [\strokec8 i\strokec4 ][\cf9 \strokec9 0\cf4 \strokec4 ]);\cb1 \
\cb3       \cf2 \strokec2 if\cf4 \strokec4  (\strokec8 cell\strokec4 .\strokec8 startsWith\strokec4 (\strokec8 prefix\strokec4 )) \{\cb1 \
\cb3         \cf2 \strokec2 const\cf4 \strokec4  \strokec8 num\strokec4  = \strokec8 parseInt\strokec4 (\strokec8 cell\strokec4 .\strokec8 substring\strokec4 (\strokec8 prefix\strokec4 .\strokec8 length\strokec4 ));\cb1 \
\cb3         \cf2 \strokec2 if\cf4 \strokec4  (!\strokec8 isNaN\strokec4 (\strokec8 num\strokec4 ) && \strokec8 num\strokec4  > \strokec8 max\strokec4 ) \strokec8 max\strokec4  = \strokec8 num\strokec4 ;\cb1 \
\cb3       \}\cb1 \
\cb3     \}\cb1 \
\cb3     \cf2 \strokec2 return\cf4 \strokec4  \strokec8 prefix\strokec4  + \cf5 \strokec5 String\cf4 \strokec4 (\strokec8 max\strokec4 +\cf9 \strokec9 1\cf4 \strokec4 ).\strokec8 padStart\strokec4 (\strokec8 pad\strokec4 , \cf6 \strokec6 '0'\cf4 \strokec4 );\cb1 \
\cb3   \} \cf2 \strokec2 finally\cf4 \strokec4  \{\cb1 \
\cb3     \strokec8 lock\strokec4 .\strokec8 releaseLock\strokec4 ();\cb1 \
\cb3   \}\cb1 \
\cb3 \}\cb1 \
\pard\pardeftab720\partightenfactor0
\cf2 \cb3 \strokec2 function\cf4 \strokec4  \strokec8 normalizeHeader\strokec4 (\strokec8 h\strokec4 ) \{ \cf2 \strokec2 return\cf4 \strokec4  \cf5 \strokec5 String\cf4 \strokec4 (\strokec8 h\strokec4 ).\strokec8 trim\strokec4 ().\strokec8 toLowerCase\strokec4 ().\strokec8 replace\strokec4 (\cf10 \strokec10 /[^a-z0-9]/\cf2 \strokec2 g\cf4 \strokec4 , \cf6 \strokec6 ''\cf4 \strokec4 ); \}\cb1 \
\cf2 \cb3 \strokec2 function\cf4 \strokec4  \strokec8 currentDate\strokec4 () \{ \cf2 \strokec2 return\cf4 \strokec4  \cf5 \strokec5 Utilities\cf4 \strokec4 .\strokec8 formatDate\strokec4 (\cf2 \strokec2 new\cf4 \strokec4  \cf5 \strokec5 Date\cf4 \strokec4 (), \cf5 \strokec5 Session\cf4 \strokec4 .\strokec8 getScriptTimeZone\strokec4 (), \cf6 \strokec6 "yyyy/MM/dd"\cf4 \strokec4 ); \}\cb1 \
\
}