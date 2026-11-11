import { useState } from "react";
import {
  Check,
  X,
  Plus,
  Search,
  Settings,
  User,
  Users,
  UserPlus,
  Bell,
  Trash2,
  Download,
  AlertCircle,
  Info,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  MoreHorizontal,
  Calendar,
  BarChart3,
  MessageSquare,
  Target,
  Bot,
  Megaphone,
  LayoutDashboard,
  Zap,
  Phone,
  FileText,
  Mail,
  Clock,
  Star,
  Heart,
  Eye,
  EyeOff,
  Menu,
  Home,
  Package,
  Tag,
  Copy,
  Share2,
  Bookmark,
  Filter,
  SortAsc,
  RefreshCw,
  ExternalLink,
  HelpCircle,
  LogOut,
  Shield,
  CreditCard,
  Globe,
  Lock,
  Key,
  Smartphone,
  Laptop,
  Monitor,
  Moon,
  Sun,
  MonitorPlay,
  Sparkles,
  Radio,
  Layers,
  Palette,
  Type,
  Box,
  Hash,
  ArrowUp,
  ArrowDown,
  Minus,
  XCircle,
  AlertOctagon,
  Flame,
  Droplets,
  Leaf,
  Bug,
  Code,
  Terminal,
  Cpu,
  HardDrive,
  Wifi,
  Bluetooth,
  Battery,
  Signal,
  Volume2,
  Mic,
  Camera,
  Video,
  Image,
  File,
  Folder,
  FileCode,
  Archive,
  Upload,
  Link,
  Unlink,
  RotateCw,
  RotateCcw,
  Maximize,
  Minimize,
  Crop,
  Briefcase,
  Building2,
  DollarSign,
  Receipt,
  TrendingUp,
  TrendingDown,
  Cog,
  Sliders,
  ToggleLeft,
  ToggleRight,
  Wrench,
  Hammer,
  MemoryStick,
  Server,
  Cloud,
  Tablet,
  ShieldAlert,
  Inbox,
  Loader2,
} from "lucide-react";
import { PageHeader } from "@/components/shared";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  PresenceAvatar,
  Kbd,
  EmptyState,
  ErrorState,
  StatCard,
  ProgressRing,
} from "@/components/shared";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme";

export function DesignSystem() {
  const [switchState, setSwitchState] = useState(false);
  const [sliderValue, setSliderValue] = useState([50]);
  const [progress, setProgress] = useState(66);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("colors");
  const { theme, setTheme } = useTheme();

  const icons = [
    {
      name: "Navigation",
      icons: [
        Home,
        Menu,
        ChevronRight,
        ArrowUp,
        ArrowDown,
        Minus,
        X,
        Plus,
        Search,
        Filter,
        SortAsc,
        RefreshCw,
        ExternalLink,
        HelpCircle,
      ],
    },
    {
      name: "Users",
      icons: [User, Users, UserPlus, Shield, Lock, Key, LogOut],
    },
    {
      name: "Actions",
      icons: [Check, X, Plus, Trash2, Download, Copy, Share2, Bookmark],
    },
    { name: "Media", icons: [Image, Video, Camera, Mic, Volume2, Sparkles] },
    {
      name: "Files",
      icons: [File, FileText, FileCode, Folder, Archive, Upload, Link, Unlink],
    },
    {
      name: "Communication",
      icons: [Mail, MessageSquare, Phone, Bell, Radio, Signal, Wifi, Bluetooth],
    },
    {
      name: "Business",
      icons: [
        Briefcase,
        Building2,
        DollarSign,
        CreditCard,
        Receipt,
        Package,
        Tag,
        BarChart3,
        TrendingUp,
        TrendingDown,
      ],
    },
    { name: "Calendar", icons: [Calendar, Clock] },
    {
      name: "Settings",
      icons: [Settings, Cog, Sliders, ToggleLeft, ToggleRight, Wrench, Hammer],
    },
    {
      name: "System",
      icons: [
        Cpu,
        HardDrive,
        MemoryStick,
        Server,
        Cloud,
        Monitor,
        Laptop,
        Smartphone,
        Tablet,
      ],
    },
    {
      name: "Alerts",
      icons: [
        AlertCircle,
        AlertTriangle,
        Info,
        CheckCircle,
        XCircle,
        AlertOctagon,
        ShieldAlert,
      ],
    },
    {
      name: "Misc",
      icons: [
        Star,
        Heart,
        Eye,
        EyeOff,
        Zap,
        Flame,
        Droplets,
        Leaf,
        Bug,
        Globe,
        Layers,
        Palette,
        Type,
        Box,
        Hash,
        RotateCw,
        RotateCcw,
        Maximize,
        Minimize,
        Crop,
        Inbox,
      ],
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Design System"
          description="All components, colors, and icons used in Konvo."
        />
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? (
              <>
                <Moon className="size-4 mr-2" />
                Dark
              </>
            ) : (
              <>
                <Sun className="size-4 mr-2" />
                Light
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="typography">Typography</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="icons">Icons</TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Color Palette</h2>
            <div className="grid gap-6">
              <div>
                <h3 className="text-sm font-medium mb-3">Primary</h3>
                <div className="flex gap-3">
                  <div className="space-y-1">
                    <div className="w-16 h-16 rounded-lg bg-primary border" />
                    <p className="text-xs text-muted-foreground">Primary</p>
                  </div>
                  <div className="space-y-1">
                    <div className="w-16 h-16 rounded-lg bg-primary-hover border" />
                    <p className="text-xs text-muted-foreground">Hover</p>
                  </div>
                  <div className="space-y-1">
                    <div className="w-16 h-16 rounded-lg bg-primary-pressed border" />
                    <p className="text-xs text-muted-foreground">Pressed</p>
                  </div>
                  <div className="space-y-1">
                    <div className="w-16 h-16 rounded-lg bg-primary-soft border" />
                    <p className="text-xs text-muted-foreground">Soft</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-3">Semantic</h3>
                <div className="flex gap-3">
                  <div className="space-y-1">
                    <div className="w-16 h-16 rounded-lg bg-success border" />
                    <p className="text-xs text-muted-foreground">Success</p>
                  </div>
                  <div className="space-y-1">
                    <div className="w-16 h-16 rounded-lg bg-warning border" />
                    <p className="text-xs text-muted-foreground">Warning</p>
                  </div>
                  <div className="space-y-1">
                    <div className="w-16 h-16 rounded-lg bg-destructive border" />
                    <p className="text-xs text-muted-foreground">Danger</p>
                  </div>
                  <div className="space-y-1">
                    <div className="w-16 h-16 rounded-lg bg-info border" />
                    <p className="text-xs text-muted-foreground">Info</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-3">Neutrals</h3>
                <div className="flex gap-3">
                  <div className="space-y-1">
                    <div className="w-16 h-16 rounded-lg bg-background border" />
                    <p className="text-xs text-muted-foreground">Background</p>
                  </div>
                  <div className="space-y-1">
                    <div className="w-16 h-16 rounded-lg bg-card border" />
                    <p className="text-xs text-muted-foreground">Card</p>
                  </div>
                  <div className="space-y-1">
                    <div className="w-16 h-16 rounded-lg bg-muted border" />
                    <p className="text-xs text-muted-foreground">Muted</p>
                  </div>
                  <div className="space-y-1">
                    <div className="w-16 h-16 rounded-lg bg-border border" />
                    <p className="text-xs text-muted-foreground">Border</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="typography" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Typography Scale</h2>
            <div className="space-y-4">
              <div>
                <p className="text-2xl font-display font-bold">
                  Heading 1 - 32px
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Plus Jakarta Sans, Bold
                </p>
              </div>
              <div>
                <p className="text-xl font-display font-bold">
                  Heading 2 - 24px
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Plus Jakarta Sans, Bold
                </p>
              </div>
              <div>
                <p className="text-lg font-display font-semibold">
                  Heading 3 - 20px
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Plus Jakarta Sans, Semibold
                </p>
              </div>
              <div>
                <p className="text-md font-medium">Body - 16px</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Inter, Medium
                </p>
              </div>
              <div>
                <p className="text-base">Body - 14px</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Inter, Regular
                </p>
              </div>
              <div>
                <p className="text-sm">Small - 13px</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Inter, Regular
                </p>
              </div>
              <div>
                <p className="text-xs">Extra Small - 12px</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Inter, Regular
                </p>
              </div>
            </div>
            <Separator className="my-6" />
            <h2 className="text-lg font-semibold mb-4">Tabular Numbers</h2>
            <div className="space-y-2">
              <p className="tabular">1,234,567.89</p>
              <p className="tabular text-success">+12.5%</p>
              <p className="tabular text-destructive">-8.3%</p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="components" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Buttons - All States</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-3">Default variants</h3>
                <div className="flex flex-wrap gap-3">
                  <Button>Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="destructive">Destructive</Button>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-3">Loading state</h3>
                <div className="flex flex-wrap gap-3">
                  <Button loading>Primary</Button>
                  <Button variant="secondary" loading>
                    Secondary
                  </Button>
                  <Button variant="ghost" loading>
                    Ghost
                  </Button>
                  <Button variant="outline" loading>
                    Outline
                  </Button>
                  <Button variant="destructive" loading>
                    Destructive
                  </Button>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-3">Disabled state</h3>
                <div className="flex flex-wrap gap-3">
                  <Button disabled>Primary</Button>
                  <Button variant="secondary" disabled>
                    Secondary
                  </Button>
                  <Button variant="ghost" disabled>
                    Ghost
                  </Button>
                  <Button variant="outline" disabled>
                    Outline
                  </Button>
                  <Button variant="destructive" disabled>
                    Destructive
                  </Button>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-3">Sizes</h3>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="sm">Small</Button>
                  <Button>Default</Button>
                  <Button size="lg">Large</Button>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-3">With icons</h3>
                <div className="flex flex-wrap gap-3">
                  <Button>
                    <Plus className="size-4 mr-2" /> Create
                  </Button>
                  <Button variant="outline">
                    <Download className="size-4 mr-2" /> Download
                  </Button>
                  <Button variant="destructive">
                    <Trash2 className="size-4 mr-2" /> Delete
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Badges - All States</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-3">Default variants</h3>
                <div className="flex flex-wrap gap-3">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                  <Badge className="bg-success text-success-foreground">
                    Success
                  </Badge>
                  <Badge className="bg-warning text-warning-foreground">
                    Warning
                  </Badge>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-3">With icons</h3>
                <div className="flex flex-wrap gap-3">
                  <Badge>
                    <Check className="size-3 mr-1" /> Done
                  </Badge>
                  <Badge variant="destructive">
                    <AlertCircle className="size-3 mr-1" /> Error
                  </Badge>
                  <Badge className="bg-success text-success-foreground">
                    <CheckCircle className="size-3 mr-1" /> Approved
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Avatars - All States</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-3">Sizes</h3>
                <div className="flex items-center gap-4">
                  <PresenceAvatar name="Priya Sharma" size="sm" />
                  <PresenceAvatar name="Priya Sharma" />
                  <PresenceAvatar name="Priya Sharma" size="lg" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-3">Presence status</h3>
                <div className="flex items-center gap-4">
                  <PresenceAvatar name="Priya Sharma" online />
                  <PresenceAvatar name="Rohit Verma" online={false} />
                  <PresenceAvatar name="Ananya Iyer" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-3">With images</h3>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage
                      src="https://github.com/shadcn.png"
                      alt="@shadcn"
                    />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Tabs</h2>
            <Tabs defaultValue="tab1">
              <TabsList>
                <TabsTrigger value="tab1">Tab 1</TabsTrigger>
                <TabsTrigger value="tab2">Tab 2</TabsTrigger>
                <TabsTrigger value="tab3">Tab 3</TabsTrigger>
              </TabsList>
              <TabsContent value="tab1" className="mt-4">
                <p>Content for tab 1</p>
              </TabsContent>
              <TabsContent value="tab2" className="mt-4">
                <p>Content for tab 2</p>
              </TabsContent>
              <TabsContent value="tab3" className="mt-4">
                <p>Content for tab 3</p>
              </TabsContent>
            </Tabs>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Dropdown Menu</h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Open menu</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Billing</DropdownMenuItem>
                <DropdownMenuItem>Team</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Dialog</h2>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Open dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you sure?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete
                    your account.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setDialogOpen(false)}
                  >
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Tooltip</h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">Hover me</Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>This is a tooltip</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Keyboard Shortcut</h2>
            <div className="flex items-center gap-2">
              <span>Press</span>
              <Kbd>Ctrl</Kbd>
              <span>+</span>
              <Kbd>K</Kbd>
              <span>to open search</span>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Separator</h2>
            <div className="space-y-4">
              <div>
                <p>Content above</p>
                <Separator />
                <p>Content below</p>
              </div>
              <div className="flex items-center gap-4">
                <p>Left</p>
                <Separator orientation="vertical" className="h-8" />
                <p>Right</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="forms" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">
              Input Fields - All States
            </h2>
            <div className="space-y-4 max-w-md">
              <div>
                <h3 className="text-sm font-medium mb-3">Default</h3>
                <div className="space-y-2">
                  <Input placeholder="Default input" />
                  <Input placeholder="Disabled input" disabled />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-3">With error</h3>
                <div className="space-y-2">
                  <Input
                    placeholder="Error state"
                    className="border-destructive"
                  />
                  <p className="text-xs text-destructive">
                    This field is required
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-3">
                  With icons (visual placeholder)
                </h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input placeholder="Search..." className="pl-9" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-3">Types</h3>
                <div className="space-y-2">
                  <Input type="email" placeholder="you@example.com" />
                  <Input type="password" placeholder="••••••••" />
                  <Input type="number" placeholder="123" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-3">Textarea</h3>
                <Textarea placeholder="Enter multiple lines..." rows={4} />
                <Textarea
                  placeholder="Disabled textarea"
                  rows={4}
                  disabled
                  className="mt-2"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Select</h2>
            <div className="space-y-4 max-w-md">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="option1">Option 1</SelectItem>
                  <SelectItem value="option2">Option 2</SelectItem>
                  <SelectItem value="option3">Option 3</SelectItem>
                </SelectContent>
              </Select>
              <Select disabled>
                <SelectTrigger>
                  <SelectValue placeholder="Disabled select" />
                </SelectTrigger>
              </Select>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">
              Checkbox - All States
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox id="check1" />
                <Label htmlFor="check1">Unchecked</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="check2" defaultChecked />
                <Label htmlFor="check2">Checked</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="check3" disabled />
                <Label htmlFor="check3">Disabled unchecked</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="check4" defaultChecked disabled />
                <Label htmlFor="check4">Disabled checked</Label>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Switch - All States</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Switch
                  id="switch1"
                  checked={switchState}
                  onCheckedChange={setSwitchState}
                />
                <Label htmlFor="switch1">Unchecked</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="switch2" defaultChecked />
                <Label htmlFor="switch2">Checked</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="switch3" disabled />
                <Label htmlFor="switch3">Disabled unchecked</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="switch4" defaultChecked disabled />
                <Label htmlFor="switch4">Disabled checked</Label>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">
              Radio Group - All States
            </h2>
            <RadioGroup defaultValue="option1">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="option1" id="radio1" />
                <Label htmlFor="radio1">Option 1</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="option2" id="radio2" />
                <Label htmlFor="radio2">Option 2</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="option3" id="radio3" />
                <Label htmlFor="radio3">Option 3</Label>
              </div>
            </RadioGroup>
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-3">Disabled</h3>
              <RadioGroup defaultValue="option1" disabled>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="option1" id="radio4" />
                  <Label htmlFor="radio4">Option 1</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="option2" id="radio5" />
                  <Label htmlFor="radio5">Option 2</Label>
                </div>
              </RadioGroup>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Slider</h2>
            <div className="max-w-md space-y-4">
              <Slider
                value={sliderValue}
                onValueChange={setSliderValue}
                max={100}
                step={1}
              />
              <p className="text-sm text-muted-foreground">
                Value: {sliderValue[0]}
              </p>
              <Slider defaultValue={[50]} disabled />
              <p className="text-sm text-muted-foreground">Disabled slider</p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Progress</h2>
            <div className="space-y-4 max-w-md">
              <Progress value={progress} />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => setProgress(Math.max(0, progress - 10))}
                >
                  -10%
                </Button>
                <Button
                  size="sm"
                  onClick={() => setProgress(Math.min(100, progress + 10))}
                >
                  +10%
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Progress Ring</h2>
            <div className="flex items-center gap-8">
              <ProgressRing value={progress} />
              <div className="space-y-2">
                <Button
                  size="sm"
                  onClick={() => setProgress(Math.max(0, progress - 10))}
                >
                  -10%
                </Button>
                <Button
                  size="sm"
                  onClick={() => setProgress(Math.min(100, progress + 10))}
                >
                  +10%
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Alerts</h2>
            <div className="space-y-4 max-w-md">
              <Alert>
                <Info className="size-4" />
                <AlertTitle>Information</AlertTitle>
                <AlertDescription>
                  This is an informational alert.
                </AlertDescription>
              </Alert>
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  Something went wrong. Please try again.
                </AlertDescription>
              </Alert>
              <Alert className="border-success bg-success-soft text-success">
                <CheckCircle className="size-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>
                  Your changes have been saved.
                </AlertDescription>
              </Alert>
              <Alert className="border-warning bg-warning-soft text-warning">
                <AlertTriangle className="size-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  Please review before proceeding.
                </AlertDescription>
              </Alert>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Skeleton Loading</h2>
            <div className="space-y-4 max-w-md">
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
              <Skeleton className="h-32 w-full" />
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Empty State</h2>
            <EmptyState
              icon={Inbox}
              title="No items found"
              description="There are no items to display here."
              action={
                <Button onClick={() => toast("Action clicked")}>
                  Create item
                </Button>
              }
            />
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Error State</h2>
            <ErrorState
              message="Failed to load data"
              onRetry={() => toast("Retrying...")}
            />
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Stat Card</h2>
            <div className="grid gap-4 sm:grid-cols-2 max-w-2xl">
              <StatCard
                label="Total Users"
                value="1,234"
                delta={12}
                trend={[10, 12, 11, 14, 13, 15, 14]}
                icon={Users}
              />
              <StatCard
                label="Avg. Response"
                value="3.4 min"
                delta={-8}
                trend={[6, 5.5, 5, 4.8, 4.1, 3.9, 3.4]}
                icon={Clock}
                goodWhenDown
              />
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Toast Notifications</h2>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => toast("Default toast")}>Default</Button>
              <Button
                variant="secondary"
                onClick={() => toast.success("Success toast")}
              >
                Success
              </Button>
              <Button
                variant="destructive"
                onClick={() => toast.error("Error toast")}
              >
                Error
              </Button>
              <Button
                variant="outline"
                onClick={() => toast.info("Info toast")}
              >
                Info
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="icons" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">
              Icon Library (Lucide React)
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              A selection of commonly used icons from Lucide React.
            </p>
            <div className="space-y-6">
              {icons.map((category) => (
                <div key={category.name}>
                  <h3 className="text-sm font-medium mb-3">{category.name}</h3>
                  <div className="flex flex-wrap gap-3">
                    {category.icons.map((Icon, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          toast("Icon clicked");
                        }}
                        className="flex items-center justify-center w-10 h-10 rounded-md border bg-card hover:bg-muted transition-colors"
                        title={`${category.name} icon ${idx + 1}`}
                      >
                        <Icon className="size-5" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
