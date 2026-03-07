import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Recycle, Wrench, Search, Tag, ArrowRight } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBatteries } from '@/hooks/useBatteries';
import { toast } from 'sonner';

export const Marketplace = () => {
    const { batteries } = useBatteries();
    const [searchTerm, setSearchTerm] = useState('');

    // Mock data mixed with real data for demonstration
    const marketplaceItems = [
        ...batteries.filter(b => b.status === 'repairable' || b.status === 'recyclable').map(b => ({
            id: b.id,
            title: `${b.type} Battery Unit`,
            type: b.type,
            capacity: b.capacity,
            soh: b.soh,
            price: b.status === 'repairable' ? Math.floor(b.capacity / 100) : 0, // Mock price logic
            status: b.status,
            image: b.image || 'https://images.unsplash.com/photo-1619641476961-e3db7c1a84cd?w=400&q=80',
            seller: 'You'
        })),
        // Add some mock listings from "others"
        {
            id: 'mock-1',
            title: 'High Capacity Li-ion Pack',
            type: 'Li-ion',
            capacity: 5000,
            soh: 78,
            price: 45,
            status: 'repairable',
            image: 'https://images.unsplash.com/photo-1619641476961-e3db7c1a84cd?w=400&q=80',
            seller: 'EcoTech Solutions'
        },
        {
            id: 'mock-2',
            title: 'Lead-Acid Bank (Needs Refurb)',
            type: 'Lead-Acid',
            capacity: 12000,
            soh: 65,
            price: 80,
            status: 'repairable',
            image: 'https://images.unsplash.com/photo-1599368812662-7935471d4411?w=400&q=80',
            seller: 'Solar Systems Inc'
        }
    ];

    const filteredItems = marketplaceItems.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleBuy = (item: any) => {
        toast.success(`Order placed for ${item.title}!`, {
            description: "The seller will contact you for shipping details."
        });
    };

    const handleRecycle = (item: any) => {
        toast.success(`Pickup scheduled for ${item.title}`, {
            description: "A certified recycler will arrive within 24 hours."
        });
    };

    return (
        <AppLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between gap-4 items-end md:items-center">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <span className="p-3 bg-primary/10 rounded-xl text-primary">
                                <ShoppingBag className="w-8 h-8" />
                            </span>
                            Second-Life Marketplace
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Buy repairable batteries for projects or recycle spent ones responsibly.
                        </p>
                    </div>
                    <Button>
                        <Tag className="w-4 h-4 mr-2" /> Sell Your Battery
                    </Button>
                </div>

                <div className="flex gap-4 items-center bg-card p-4 rounded-lg border shadow-sm">
                    <Search className="w-5 h-5 text-muted-foreground" />
                    <Input
                        placeholder="Search for batteries, chemistry, or voltage..."
                        className="border-none shadow-none focus-visible:ring-0"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <Tabs defaultValue="repairable" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                        <TabsTrigger value="repairable" className="gap-2">
                            <Wrench className="w-4 h-4" /> DIY Repair Shop
                        </TabsTrigger>
                        <TabsTrigger value="recyclable" className="gap-2">
                            <Recycle className="w-4 h-4" /> Recycler Depot
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="repairable" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredItems.filter(i => i.status === 'repairable').map((item) => (
                                <ItemCard key={item.id} item={item} onAction={handleBuy} actionLabel="Buy Now" icon={ShoppingBag} />
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="recyclable" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredItems.filter(i => i.status === 'recyclable').map((item) => (
                                <ItemCard key={item.id} item={item} onAction={handleRecycle} actionLabel="Schedule Pickup" icon={Recycle} variant="recyclable" />
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
};

const ItemCard = ({ item, onAction, actionLabel, icon: Icon, variant = 'default' }: any) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
            <div className="h-48 overflow-hidden relative">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <Badge className="absolute top-3 right-3 bg-black/50 backdrop-blur-md hover:bg-black/70">
                    {item.soh}% SoH
                </Badge>
            </div>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        <CardDescription className="text-xs mt-1">Sold by {item.seller}</CardDescription>
                    </div>
                    {item.price > 0 && (
                        <span className="font-bold text-xl text-primary">${item.price}</span>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-secondary/50 p-2 rounded">
                        <span className="text-xs text-muted-foreground block">Capacity</span>
                        <span className="font-medium">{item.capacity} mAh</span>
                    </div>
                    <div className="bg-secondary/50 p-2 rounded">
                        <span className="text-xs text-muted-foreground block">Chemistry</span>
                        <span className="font-medium">{item.type}</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full gap-2" variant={variant === 'recyclable' ? 'destructive' : 'default'} onClick={() => onAction(item)}>
                    <Icon className="w-4 h-4" /> {actionLabel}
                </Button>
            </CardFooter>
        </Card>
    </motion.div>
);

export default Marketplace;
