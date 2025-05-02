"use client"

import * as React from "react"
import {
  Legend,
  ResponsiveContainer,
  Tooltip, type LegendProps, type TooltipProps
} from "recharts"

import { cn } from "@/lib/utils"

export interface ChartConfig {
  [key: string]: {
    label: string
    color?: string
  }
}

interface ChartContextValue {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextValue | null>(null)

function useChartContext() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChartContext must be used within a ChartProvider")
  }

  return context
}

interface ChartProviderProps {
  config: ChartConfig
  children: React.ReactNode
}

function ChartProvider({ config, children }: ChartProviderProps) {
  const value = React.useMemo(() => ({ config }), [config])

  return (
    <ChartContext.Provider value={value}>{children}</ChartContext.Provider>
  )
}

interface ChartRootProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig
}

function ChartRoot({
  config,
  className,
  children,
  ...props
}: ChartRootProps) {
  React.useEffect(() => {
    const style = document.createElement("style")
    const css = Object.entries(config)
      .filter(([_, value]) => value.color)
      .map(
        ([key, value]) => `
        :root {
          --color-${key}: ${value.color};
        }
      `
      )
      .join("")

    style.textContent = css
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [config])

  return (
    <ChartProvider config={config}>
      <div className={cn("h-full w-full", className)} {...props}>
        <ResponsiveContainer width="100%" height="100%">
          {React.isValidElement(children) ? (
            children
          ) : (
            <div>{children}</div> // fallback qui "emballe" les enfants non valides
          )}
        </ResponsiveContainer>
      </div>
    </ChartProvider>
  )
}

interface ChartTooltipContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  active?: boolean
  payload?: TooltipProps<any, any>["payload"]
  label?: string
  formatter?: TooltipProps<any, any>["formatter"]
  labelFormatter?: TooltipProps<any, any>["labelFormatter"]
  hideLabel?: boolean
}

function ChartTooltipContent({
  active,
  payload,
  label,
  formatter,
  labelFormatter,
  hideLabel = false,
  className,
  ...props
}: ChartTooltipContentProps) {
  const { config } = useChartContext()

  if (!active || !payload?.length) {
    return null
  }

  return (
    <div
      className={cn(
        "rounded-lg border bg-background p-2 shadow-sm",
        className
      )}
      {...props}
    >
      {!hideLabel && (
        <div className="grid grid-flow-col items-center gap-1 text-sm">
          {labelFormatter ? labelFormatter(label, payload) : label}
        </div>
      )}
      <div className="grid gap-0.5">
        {payload.map((item: any, index: number) => {
          const dataKey = item.dataKey
          const itemConfig = config[dataKey]
          const color = itemConfig?.color || item.color

          return (
            <div
              key={index}
              className="grid grid-flow-col items-center justify-start gap-1 text-sm"
            >
              <div
                className="h-2 w-2 rounded-full"
                style={{ background: color }}
              />
              <span className="font-medium">
                {itemConfig?.label || dataKey}:
              </span>
              <span>
                {formatter
                  ? formatter(item.value, item.name, item, index, payload)
                  : item.value}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface ChartTooltipProps
  extends Omit<TooltipProps<any, any>, "content" | "ref"> {
  content?: React.ReactNode;
  hideLabel?: boolean;
  formatter?: TooltipProps<any, any>["formatter"];
  labelFormatter?: TooltipProps<any, any>["labelFormatter"];
}

const ChartTooltip = React.forwardRef<
  HTMLDivElement,
  ChartTooltipProps & React.RefAttributes<HTMLDivElement>
>(({ content: customContent, formatter, labelFormatter, hideLabel, ...rechartsProps }, ref) => {
  return (
    <Tooltip
      {...rechartsProps}
      content={
        customContent
          ? (customContent as any)
          : ((tooltipProps) => {
            const { active, payload, label } = tooltipProps;
            return (
              <ChartTooltipContent
                active={active}
                payload={payload}
                label={label}
                formatter={formatter}
                labelFormatter={labelFormatter}
                hideLabel={hideLabel}
              />
            );
          })
      }
    />
  );
});
ChartTooltip.displayName = "ChartTooltip";

interface ChartLegendContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  payload?: LegendProps["payload"]
  nameKey?: string
}

function ChartLegendContent({
  payload,
  nameKey = "name",
  className,
  ...props
}: ChartLegendContentProps) {
  const { config } = useChartContext()

  if (!payload?.length) {
    return null
  }

  return (
    <div
      className={cn("grid grid-flow-col items-center gap-4", className)}
      {...props}
    >
      {payload.map((item: any, index: number) => {
        const dataKey = item.dataKey || item.value
        const itemConfig = config[dataKey]
        const color = itemConfig?.color || item.color

        return (
          <div
            key={index}
            className="grid grid-flow-col items-center justify-start gap-1 text-sm"
          >
            <div
              className="h-2 w-2 rounded-full"
              style={{ background: color }}
            />
            <span className="whitespace-nowrap">
              {itemConfig?.label || item[nameKey] || dataKey}
            </span>
          </div>
        )
      })}
    </div>
  )
}

interface ChartLegendProps extends Omit<LegendProps, "content" | "ref"> {
  content?: React.ReactNode;
  nameKey?: string;
}

const ChartLegend = React.forwardRef<
  HTMLDivElement,
  ChartLegendProps & React.RefAttributes<HTMLDivElement>
>(({ content: customContent, ...rechartsProps }, ref) => {
  return (
    <Legend
      {...rechartsProps}
      content={
        customContent
          ? (customContent as any)
          : ((legendProps) => {
            const { payload } = legendProps;
            return (
              <ChartLegendContent
                payload={payload}
                nameKey={rechartsProps.nameKey}
              />
            );
          })
      }
    />
  );
});
ChartLegend.displayName = "ChartLegend"

export {
  ChartRoot as ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent
}
