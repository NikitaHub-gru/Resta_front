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
import { ScrollArea } from "@/components/ui/scroll-area";

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
      <DialogContent className="sm:max-w-[800px]  w-full bg-[#171717] max-h-[90vh]">
        <BorderBeam size={250} duration={12} delay={9} />
        <DialogHeader>
          <DialogDescription>
            {description_info && (
              <div className="mt-1 w-full">
                <h4 className="text-lg text-center mb-4">
                  Информация о отчете:
                </h4>
                <ScrollArea className="h-[calc(90vh-180px)] w-full rounded-md">
                  <div className="text-sm text-white px-8">
                    {description_info.split("\n\n").map((paragraph, index) => (
                      <p key={index} className="mb-4 whitespace-pre-line">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
