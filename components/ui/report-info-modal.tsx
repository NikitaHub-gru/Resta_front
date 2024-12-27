import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { BorderBeam } from "./border-beam";
import { useEffect, useState } from "react";
import { getAuthUser } from "@/hooks/getauthuser";

interface ReportInfoModalProps {
  title: string;
  description: string;
  description_info?: string;
}

export function ReportInfoModal({
  title,
  description,
  description_info,
}: ReportInfoModalProps) {
  const [userCorporation, setUserCorporation] = useState<string>("");

  useEffect(() => {
    const fetchUserData = async () => {
      const userData = await getAuthUser();
      setUserCorporation(userData.corporation || "");
    };
    fetchUserData();
  }, []);

  if (userCorporation !== "RestaLabs") {
    return null;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="icon" className="h-[30px]">
          <Info className="w-[30px] h-[30px]" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]  bg-[#171717]">
        <BorderBeam size={250} duration={12} delay={9} />
        <DialogHeader>
          <DialogDescription>
            {description_info && (
              <div className="mt-1">
                <h4 className="text-lg text-center">Информация о отчете:</h4>
                <p className="text-sm text-white mt-2 text-wrap text-left">
                  {description_info}
                </p>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
