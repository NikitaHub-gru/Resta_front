"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChartPie, BarChart3, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { Meteors } from "../ui/meteors";
import { getAuthUser } from "@/hooks/getauthuser";

export function HeroSection() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen flex items-center">
      <div className="absolute inset-0 from-primary/5 to-secondary/5" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Преобразуйте Свой бизнес в сфере HoReCa
            <span className="text-primary block mt-2">
              С помощью расширенной аналитики
            </span>
          </h1>
          <p className="mt-6 text-xl text-muted-foreground max-w-3xl mx-auto">
            Благодаря нашим комплексным решениям для создания отчетов,
            разработанным специально для отелей, ресторанов и предприятий
            общественного питания, вы сможете получать ценные аналитические
            данные и стимулировать рост и это тест.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Button
              size="lg"
              onClick={async () => {
                const user = await getAuthUser();
                if (user.corporation === "Grill№1") {
                  router.push("/orders");
                } else {
                  router.push("/reports");
                }
              }}
            >
              Начать
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                router.push("https://restu.ru/");
              }}
            >
              Информация о компании
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {[
            {
              icon: ChartPie,
              title: "Аналитика в реальном времени",
              description:
                "Мониторинг вашей бизнес-производительности в реальном времени с интерактивными панелями",
            },
            {
              icon: BarChart3,
              title: "Отчеты по вашим потребностям",
              description:
                "Создание и настройка отчетов, специально адаптированных к вашим конкретным бизнес-потребностям",
            },
            {
              icon: TrendingUp,
              title: "Прогнозные данные",
              description:
                "Принятие данных-ориентированных решений с использованием AI-powered forecasting and trends",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="relative group p-6 bg-card/30 rounded-lg border transition-all hover:shadow-lg overflow-hidden"
            >
              <Meteors number={8} />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity" />
              <feature.icon className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
