import {
   Dialog,
   DialogTitle,
   DialogContent,
   DialogActions,
   Button,
   Typography,
   useTheme,
} from "@mui/material";
import { AlertTriangle, Clock3, CheckCircle2, XCircle } from "lucide-react";


interface UploadToAtlasDialogProps {
   open: boolean;
   onConfirm: () => void;
   onCancel: () => void;
   status: "pending" | "success" | "failed" | null;
   timestamp: number | null;
}


export const UploadToAtlasDialog = ({
   open,
   onConfirm,
   onCancel,
   status,
   timestamp,
}: UploadToAtlasDialogProps) => {
   const theme = useTheme();


   const formatTime = (ts: number | null) => {
       if (!ts) return null;
       const date = new Date(ts);
       return date.toLocaleString("en-NZ", {
         timeZone: "Pacific/Auckland",
         hour12: true,
         year: "numeric",
         month: "short",
         day: "numeric",
         hour: "2-digit",
         minute: "2-digit",
       });
     };


   const renderStatus = () => {
       switch (status) {
           case "pending":
               return (
                   <Typography color="warning.main" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                       <Clock3 size={16} /> Queued for upload ({formatTime(timestamp)})
                   </Typography>
               );
           case "success":
               return (
                   <Typography color="success.main" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                       <CheckCircle2 size={16} /> Last uploaded at {formatTime(timestamp)}
                   </Typography>
               );
           case "failed":
               return (
                   <Typography color="error.main" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                       <XCircle size={16} /> Upload failed at {formatTime(timestamp)}
                   </Typography>
               );
           default:
               return (
                   <Typography color="text.secondary">
                       No uploads queued or completed.
                   </Typography>
               );
       }
   };


   return (
       <Dialog open={open} onClose={onCancel} scroll="paper">
           <DialogTitle sx={{ fontWeight: "bold" }}>Upload to Atlas Cloud Database / Tuku ki Atlas</DialogTitle>


           <DialogContent
               dividers
               sx={{
                   '&::-webkit-scrollbar': { width: '8px' },
                   '&::-webkit-scrollbar-track': { backgroundColor: theme.palette.background.default },
                   '&::-webkit-scrollbar-thumb': { backgroundColor: '#888', borderRadius: '4px' },
                   '&::-webkit-scrollbar-thumb:hover': { backgroundColor: '#666' },
                   scrollbarColor: '#888 transparent',
                   scrollbarWidth: 'thin',
               }}
           >
               {/* 🟡 Status */}
               <div style={{ marginBottom: theme.spacing(2) }}>{renderStatus()}</div>


               <Typography gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                   <AlertTriangle size={18} color={theme.palette.warning.main} />
                   You are about to upload local data to the Atlas Cloud Database. This will:
               </Typography>


               <ul style={{ paddingLeft: theme.spacing(3), marginBottom: theme.spacing(2) }}>
                   <li><Typography>- Overwrite existing records on Atlas Cloud Database</Typography></li>
                   <li><Typography>- Replace team and competition data</Typography></li>
                   <li><Typography>- Reset ECU logs and race results</Typography></li>
               </ul>


               <Typography sx={{ mt: 2, fontWeight: 600 }}>
                   No Internet Connection? / Kāore he Hononga Ipurangi?
               </Typography>
               <Typography sx={{ mt: 1 }}>
                   If your device is offline when you press Upload, the request won’t go through immediately. Instead, it will be <strong>queued in the background</strong>.
                   As soon as your internet connection is restored, the system will <strong>automatically attempt to upload the most recent queued data</strong> without any further action from you.
               </Typography>
               <Typography sx={{ mt: 1 }}>
                   <strong>Important:</strong> If you continue using the app and make additional changes to your data while offline, these changes <strong>will not be included</strong> in the upload unless you press Upload again.
                   The system only remembers <strong>the latest Upload button press</strong>, not all offline edits.
               </Typography>
               <Typography sx={{ mt: 1 }}>
                   To ensure your latest data is uploaded once you're back online, please press Upload again after making changes, even while offline.
               </Typography>
               <Typography sx={{ mt: 1 }}>
                   You’ll receive a confirmation once the queued upload has completed successfully.
               </Typography>
           </DialogContent>


           <DialogActions>
               <Button onClick={onCancel} variant="text">
                   Cancel
               </Button>
               <Button onClick={onConfirm} variant="contained" color="primary">
                   Upload / Tukuake
               </Button>
           </DialogActions>
       </Dialog>
   );
};