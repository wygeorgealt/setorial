import { View, Text, TouchableOpacity, ScrollView, TextInput, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, ChevronRight, PlayCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { learningApi } from '../../services/api';

export default function CoursesScreen() {
    const [subjects, setSubjects] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            const res = await learningApi.getSubjects();
            setSubjects(res.data);
        } catch (error) {
            console.error('Failed to fetch subjects:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    }, []);

    const filteredSubjects = subjects.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getSubjectColor = (index: number) => {
        const colors = ['bg-blue-100', 'bg-purple-100', 'bg-green-100', 'bg-orange-100', 'bg-pink-100'];
        return colors[index % colors.length];
    };
    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView
                className="flex-1 px-5 pt-4 pb-20"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >

                {/* Header Section */}
                <Text className="text-black text-[28px] font-bold tracking-tight mb-6">Discover</Text>

                {/* Search Bar */}
                <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-3 mb-8">
                    <Search size={20} color="#9CA3AF" />
                    <TextInput
                        placeholder="Search courses, subjects, or skills"
                        placeholderTextColor="#9CA3AF"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        className="flex-1 ml-3 text-black text-[15px] p-0"
                    />
                </View>

                {/* Categories */}
                <Text className="text-black font-bold text-xl tracking-tight mb-4">Categories</Text>
                <View className="flex-row flex-wrap mb-10">
                    {subjects.slice(0, 6).map((subject, i) => (
                        <TouchableOpacity key={subject.id} className="bg-gray-100 px-4 py-2 rounded-full mr-3 mb-3">
                            <Text className="text-black font-semibold text-[15px]">{subject.name}</Text>
                        </TouchableOpacity>
                    ))}
                    {subjects.length === 0 && (
                        <Text className="text-gray-400 text-sm">No categories available</Text>
                    )}
                </View>

                {/* Popular Courses */}
                <Text className="text-black font-bold text-xl tracking-tight mb-4">Trending Now</Text>
                <View className="border-t border-gray-100 mb-20">
                    {filteredSubjects.map((subject, index) => (
                        <CourseRow
                            key={subject.id}
                            id={subject.id}
                            title={subject.name}
                            lessons={`${subject.topics?.length || 0} topics`}
                            students="Active"
                            color={getSubjectColor(index)}
                        />
                    ))}
                    {filteredSubjects.length === 0 && (
                        <Text className="text-gray-400 text-sm py-8 text-center">
                            {searchQuery ? 'No subjects found for your search' : 'No subjects available'}
                        </Text>
                    )}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

function CourseRow({ id, title, lessons, students, color }: { id: string, title: string, lessons: string, students: string, color: string }) {
    const router = useRouter();
    return (
        <TouchableOpacity
            onPress={() => router.push(`/course-detail?id=${id}`)}
            className="flex-row items-center py-5 border-b border-gray-100 justify-between"
        >
            <View className="flex-row items-center flex-1">
                <View className={`w-12 h-12 rounded-2xl ${color} items-center justify-center mr-4`}>
                    <PlayCircle size={24} color="#000" />
                </View>
                <View className="flex-1">
                    <Text className="text-black font-bold text-[16px] mb-1">{title}</Text>
                    <Text className="text-gray-500 font-medium text-[13px]">{lessons} • {students} students</Text>
                </View>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
        </TouchableOpacity>
    );
}
