
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Sale {
    id: string;
    amount: number;
    status: string;
    created_at: string;
}

interface SalesMetrics {
    totalSales: number;
    totalRevenue: number;
    salesCount: number;
}

export const useSalesData = () => {
    const [sales, setSales] = useState<Sale[]>([]);
    const [metrics, setMetrics] = useState<SalesMetrics>({
        totalSales: 0,
        totalRevenue: 0,
        salesCount: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                setIsLoading(false);
                return;
            }

            const { data: salesData, error: salesError } = await supabase
                .from("sales" as any) // Type casting as 'sales' might not be in generated types yet
                .select("*")
                .order("created_at", { ascending: false });

            if (salesError) {
                console.error("Erro ao carregar Vendas:", salesError);
            } else if (salesData) {
                const typedSales = salesData as unknown as Sale[];
                setSales(typedSales);

                // Calculate metrics
                const salesCount = typedSales.length;
                const totalRevenue = typedSales.reduce((acc, curr) => acc + Number(curr.amount), 0);

                // For backwards compatibility/semantics, 'totalSales' in Imovi might refer to count or revenue depending on context.
                // Looking at Imovi.tsx, it renders 'SalesNumberCard' which usually takes a count, but let's check.
                // Previous fake logic was: Math.floor(totalQualified * 0.3) -> implied COUNT.

                setMetrics({
                    totalSales: salesCount, // Mapping count to 'totalSales' for clarity
                    totalRevenue,
                    salesCount,
                });
            }
        } catch (error: any) {
            console.error("Erro ao carregar dados de vendas:", error);
            toast({
                title: "Erro",
                description: "Falha ao carregar dados de vendas",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return {
        sales,
        metrics,
        isLoading,
        refetch: loadData,
    };
};
