import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import Loading_page from "../loadingP/Loading_comp";
import Zagruzka from "../loadingP/zagruzka";


interface Report {
  id: number;
  tb_name: string;
  corporation: string;
}

interface CorporationResponse {
  corporation: string;
}

export default function DoccumentationPage() {
  return (
    <div className="items-center justify-center w-full h-full flex">
      <p className="text-6xl font-bold">Тут будет документация</p>
    </div>
    // <Zagruzka/>
  );
}
