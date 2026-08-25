import React from 'react';
import { FirstAppealApplication } from '../../types/rti';
import { ConfirmationCard } from '../../components/status/ConfirmationCard';

interface AppealStep5SuccessProps {
  appeal: FirstAppealApplication;
  onTrack: (regNo: string) => void;
  onFileAnother: () => void;
}

export const AppealStep5Success: React.FC<AppealStep5SuccessProps> = ({
  appeal,
  onTrack,
  onFileAnother,
}) => {
  return (
    <div className="space-y-6">
      <ConfirmationCard
        appeal={appeal}
        onTrack={onTrack}
        onFileAnother={onFileAnother}
      />
    </div>
  );
};
