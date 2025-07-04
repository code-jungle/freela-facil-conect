import { Button } from "@/components/ui/button";
import { Edit, Save } from "lucide-react";
import type { ProfileData, EditData } from "./types";

interface ProfileActionsProps {
  editing: boolean;
  saving: boolean;
  profileData: ProfileData;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
}

export const ProfileActions = ({
  editing,
  saving,
  onEdit,
  onCancel,
  onSave,
}: ProfileActionsProps) => {
  return (
    <div className="flex justify-end">
      {editing ? (
        <div className="space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={onSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      ) : (
        <Button onClick={onEdit}>
          <Edit className="w-4 h-4 mr-2" />
          Editar
        </Button>
      )}
    </div>
  );
};