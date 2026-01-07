import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from "@mui/material";
import type { SxProps } from "@mui/system";
import { centerTextSx } from "@/utils/client/ui";

const accordionSummarySx: SxProps = {
  p: 0,
  gap: 0.5,
  flexDirection: "row-reverse",
  minHeight: 0,
  "& .MuiAccordionSummary-content": { margin: 0 },
  "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": { transform: "rotate(90deg)" },
};

const PanelExpandIcon = () => (
  <Box sx={{ color: "text.primary" }}>
    <i className="codicon codicon-chevron-right" style={{ display: "block" }} />
  </Box>
);

const Panel = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Box sx={{ p: 0.25 }}>
    <Accordion defaultExpanded disableGutters elevation={0} sx={{ bgcolor: "background.paper", p: 1, width: 1 }}>
      <AccordionSummary sx={accordionSummarySx} expandIcon={<PanelExpandIcon />}>
        <Typography variant="body2" sx={centerTextSx}>
          {title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0.5, pt: 1.5, pb: 0 }}>{children}</AccordionDetails>
    </Accordion>
  </Box>
);

export { Panel };
