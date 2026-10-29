'use client';

import { useState } from 'react';
import { generateUserReport, downloadPDF } from '@/lib/api/reports';
import { Button } from '@/components/ui/button';
import { FileText, Loader2 } from 'lucide-react';

interface GenerateReportButtonProps {
  userId: number;
  username: string;
}

export function GenerateReportButton({ userId, username }: GenerateReportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      const blob = await generateUserReport(userId);
      const filename = `training_report_${username.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      downloadPDF(blob, filename);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleGenerate}
      disabled={isGenerating}
      variant="outline"
      size="sm"
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <FileText className="mr-2 h-4 w-4" />
          Generate PDF Report
        </>
      )}
    </Button>
  );
}
