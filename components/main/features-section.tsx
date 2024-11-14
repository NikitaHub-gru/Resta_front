"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import {
  BarChart,
  LineChart,
  ResponsiveContainer,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"

const data = [
  { name: "Jan", value: 400 },
  { name: "Feb", value: 300 },
  { name: "Mar", value: 600 },
  { name: "Apr", value: 800 },
  { name: "May", value: 500 },
  { name: "Jun", value: 700 },
]

const CustomXAxis = (props: any) => <XAxis {...props} allowDuplicatedCategory={false} />
const CustomYAxis = (props: any) => <YAxis {...props} allowDecimals={false} />

export function FeaturesSection() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold mb-4 text-white">Мощные аналитические инструменты</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
          Получите глубокое понимание эффективности вашего бизнеса с помощью нашего комплексного пакета аналитических инструментов.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-6 bg-black/10">
              <h3 className="text-xl font-semibold mb-4 text-white">Динамика доходов</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <CustomXAxis dataKey="name" stroke="black" />
                    <CustomYAxis stroke="black" />
                    <Tooltip contentStyle={{ backgroundColor: 'black', color: 'white' }} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="white"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-6 bg-black/10">
              <h3 className="text-xl font-semibold mb-4 text-white">Статистика продаж</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <CustomXAxis dataKey="name" stroke="white" />
                    <CustomYAxis stroke="white" />
                    <Tooltip contentStyle={{ backgroundColor: 'black', color: 'white' }} />
                    <Bar
                      dataKey="value"
                      fill="white"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}