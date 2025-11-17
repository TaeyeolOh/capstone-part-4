import {
   Dialog,
   DialogTitle,
   DialogContent,
   DialogActions,
   Button,
   Typography,
   useTheme,
} from "@mui/material";
import { AlertTriangle } from "lucide-react";


interface SyncFromAtlasDialogProps {
   open: boolean;
   onConfirm: () => void;
   onCancel: () => void;
}


export const SyncFromAtlasDialog = ({
   open,
   onConfirm,
   onCancel,
}: SyncFromAtlasDialogProps) => {
   const theme = useTheme();


   return (
       <Dialog open={open} onClose={onCancel} scroll="paper">
           <DialogTitle sx={{ fontWeight: "bold" }}>
               Sync from Atlas Cloud Database / Tukutahi mai i Atlas
           </DialogTitle>


           <DialogContent dividers>
               <Typography
                   gutterBottom
                   sx={{ display: "flex", alignItems: "center", gap: 1 }}
               >
                   <AlertTriangle size={18} color={theme.palette.warning.main} />
                  <span> Your local data is <strong>out of sync</strong> with the Atlas Cloud Database. Pulling the latest data will:</span>
               </Typography>


               <ul style={{ paddingLeft: theme.spacing(3), marginBottom: theme.spacing(2) }}>
                   <li>
                       <Typography component="span">
                           - Replace local records with Cloud Databases versions
                       </Typography>
                   </li>
                   <li>
                       <Typography component="span">
                           - Discard any local only changes
                       </Typography>
                   </li>
               </ul>


               <Typography sx={{ mt: 2 }}>
                   Make sure you have saved or exported local changes before proceeding.
               </Typography>
           </DialogContent>


           <DialogActions>
               <Button onClick={onCancel} variant="text">
                   Cancel
               </Button>
               <Button onClick={onConfirm} variant="contained" color="primary">
                   Pull Latest / Tīkina Ngā Raraunga Hou
               </Button>
           </DialogActions>
       </Dialog>
   );
};
