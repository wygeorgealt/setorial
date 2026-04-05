import { View, Text, TouchableOpacity, ImageBackground, SafeAreaView, FlatList, Dimensions, NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState, useRef, useEffect } from "react";

const { width } = Dimensions.get('window');

const slides = [
    {
        id: '1',
        title: 'Onwards.',
        description: 'Setorial breaks barriers so you can build academic excellence effortlessly.',
        image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1741&auto=format&fit=crop'
    },
    {
        id: '2',
        title: 'Discover.',
        description: 'Explore thousands of courses and interactive content tailored just for you.',
        image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1740&auto=format&fit=crop'
    },
    {
        id: '3',
        title: 'Achieve.',
        description: 'Track your progress and earn rewards as you master new subjects daily.',
        image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1740&auto=format&fit=crop'
    }
];

export default function WelcomeScreen() {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    // Auto-swipe every 6 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => {
                const nextIndex = prevIndex === slides.length - 1 ? 0 : prevIndex + 1;
                flatListRef.current?.scrollToIndex({
                    index: nextIndex,
                    animated: true,
                });
                return nextIndex;
            });
        }, 6000);

        return () => clearInterval(interval);
    }, []);

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const slideSize = event.nativeEvent.layoutMeasurement.width;
        const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
        if (index !== currentIndex) {
            setCurrentIndex(index);
        }
    };

    const renderItem = ({ item }: { item: typeof slides[0] }) => {
        return (
            <View style={{ width }} className="px-6">
                <Text className="text-white text-[42px] font-bold leading-tight tracking-tight mb-3">
                    {item.title}
                </Text>
                <Text className="text-gray-300 text-lg leading-6 pr-4">
                    {item.description}
                </Text>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-black">
            <StatusBar style="light" />

            <ImageBackground
                source={{ uri: slides[currentIndex].image }}
                className="flex-1 justify-end"
                imageStyle={{ opacity: 0.7 }}
            >
                {/* Background overlay gradient (optional, but Nativewind opacity is applied above) */}

                <SafeAreaView className="flex-1 justify-between">
                    {/* Top Logo Area */}
                    <View className="px-6 pt-12 z-10">

                    </View>

                    {/* Bottom Content Area */}
                    <View className="pb-8">
                        {/* Swipable Text Area */}
                        <FlatList
                            ref={flatListRef}
                            data={slides}
                            renderItem={renderItem}
                            keyExtractor={(item) => item.id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            pagingEnabled
                            bounces={false}
                            onMomentumScrollEnd={handleScroll}
                            className="flex-grow-0 mb-8"
                        />

                        {/* Pagination Dots & Form Actions */}
                        <View className="px-6">
                            <View className="flex-row items-center space-x-1 mb-8">
                                {slides.map((_, index) => (
                                    <View
                                        key={index}
                                        className={`h-1 rounded-full ${currentIndex === index ? 'w-6 bg-white' : 'w-1.5 h-1.5 bg-gray-500'}`}
                                    />
                                ))}
                            </View>

                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => router.push('/register')}
                                className="w-full bg-[#58CC02] border-b-4 border-[#58A700] border-t-[#58CC02] border-x-[#58CC02] py-4 rounded-2xl items-center mb-4"
                            >
                                <Text className="text-white font-bold text-[17px] uppercase tracking-wider">Get Started</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => router.push('/login')}
                                className="w-full bg-white/10 border-2 border-white/20 border-b-4 py-4 rounded-2xl items-center"
                            >
                                <Text className="text-white font-bold text-[17px] uppercase tracking-wider">I Already Have An Account</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </SafeAreaView>
            </ImageBackground>
        </View>
    );
}
