import { useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { useTeamMembers } from "@/lib/ai-services";
import TeamCard from "@/components/dashboard/team-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Team() {
  const { data: teamMembers, isLoading } = useTeamMembers();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  
  const filteredTeamMembers = teamMembers?.filter(member => {
    const matchesSearch = searchQuery === "" || 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = filterStatus === "ALL" || member.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout title="Team">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
          <h3 className="text-lg font-semibold">Team Analysis</h3>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <span className="material-icons text-sm">search</span>
              </span>
              <Input
                type="text"
                placeholder="Search team members..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select
              value={filterStatus}
              onValueChange={setFilterStatus}
            >
              <SelectTrigger className="w-[140px]">
                <span className="material-icons text-sm mr-1">filter_list</span>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All</SelectItem>
                <SelectItem value="AVAILABLE">Available</SelectItem>
                <SelectItem value="LIMITED">Limited</SelectItem>
                <SelectItem value="UNAVAILABLE">Unavailable</SelectItem>
              </SelectContent>
            </Select>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button className="flex items-center">
                  <span className="material-icons text-sm mr-1">person_add</span>
                  Add Member
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add Team Member</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    This feature will be available in the next update.
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton className="h-72 rounded-lg" />
            <Skeleton className="h-72 rounded-lg" />
            <Skeleton className="h-72 rounded-lg" />
          </div>
        ) : filteredTeamMembers?.length === 0 ? (
          <div className="text-center py-10">
            <span className="material-icons text-4xl text-gray-400 mb-2">search_off</span>
            <p className="text-lg font-medium text-gray-500 dark:text-gray-400">No team members found</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTeamMembers?.map((member) => (
              <TeamCard key={member.id} member={member} />
            ))}
          </div>
        )}
        
        <div className="mt-6">
          <h4 className="text-md font-semibold mb-4">Team Expertise Distribution</h4>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 h-72 flex items-center justify-center">
            <div className="w-full h-full flex flex-col justify-between">
              <div className="text-center text-gray-500 dark:text-gray-400 mb-2">Team Skill Distribution</div>
              <div className="flex-1 flex items-center justify-center">
                <svg viewBox="0 0 200 200" className="w-full max-w-md">
                  {/* Web shape outline */}
                  <polygon points="100,10 160,40 180,100 160,160 100,190 40,160 20,100 40,40" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" />
                  {/* Inner web shapes */}
                  <polygon points="100,40 130,60 140,100 130,140 100,160 70,140 60,100 70,60" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="0.5" />
                  <polygon points="100,70 115,80 120,100 115,120 100,130 85,120 80,100 85,80" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="0.5" />
                  {/* Skill coverage shape */}
                  <polygon points="100,20 150,45 170,100 140,150 100,170 55,145 40,100 60,50" fill="hsl(216, 92%, 60%)" fillOpacity="0.2" stroke="hsl(216, 92%, 60%)" strokeWidth="1.5" />
                  {/* Axes */}
                  <line x1="100" y1="10" x2="100" y2="190" stroke="currentColor" strokeOpacity="0.2" strokeWidth="0.5" strokeDasharray="2,2" />
                  <line x1="20" y1="100" x2="180" y2="100" stroke="currentColor" strokeOpacity="0.2" strokeWidth="0.5" strokeDasharray="2,2" />
                  <line x1="40" y1="40" x2="160" y2="160" stroke="currentColor" strokeOpacity="0.2" strokeWidth="0.5" strokeDasharray="2,2" />
                  <line x1="160" y1="40" x2="40" y2="160" stroke="currentColor" strokeOpacity="0.2" strokeWidth="0.5" strokeDasharray="2,2" />
                  {/* Axis labels */}
                  <text x="100" y="5" textAnchor="middle" fontSize="8" fill="currentColor" opacity="0.7">Design</text>
                  <text x="190" y="100" textAnchor="end" fontSize="8" fill="currentColor" opacity="0.7">Development</text>
                  <text x="100" y="195" textAnchor="middle" fontSize="8" fill="currentColor" opacity="0.7">Research</text>
                  <text x="10" y="100" textAnchor="start" fontSize="8" fill="currentColor" opacity="0.7">Management</text>
                  <text x="40" y="35" textAnchor="middle" fontSize="8" fill="currentColor" opacity="0.7">QA</text>
                  <text x="160" y="35" textAnchor="middle" fontSize="8" fill="currentColor" opacity="0.7">DevOps</text>
                  <text x="160" y="165" textAnchor="middle" fontSize="8" fill="currentColor" opacity="0.7">Backend</text>
                  <text x="40" y="165" textAnchor="middle" fontSize="8" fill="currentColor" opacity="0.7">Frontend</text>
                </svg>
              </div>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">AI Analysis:</span> Team has strong coverage in Design and Development skills, but could benefit from additional Research expertise. Consider upskilling or new hires in this area.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
