import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const QuickActions = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {/* Start Tokenizing */}
      <Card className="bg-gradient-to-r from-primary/80 to-primary text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
        <CardContent className="p-6 z-10 relative flex flex-col h-full">
          <span className="material-icons text-3xl">add_business</span>
          <h3 className="text-xl font-semibold mt-4">Start Tokenizing</h3>
          <p className="mt-2 opacity-80">
            Turn your real-world assets into tradable tokens with our guided process.
          </p>
          <Link href="/tokenize">
            <Button className="mt-4 bg-white text-primary hover:bg-white/90">
              Get Started
              <span className="material-icons ml-1">arrow_forward</span>
            </Button>
          </Link>
        </CardContent>
      </Card>
      
      {/* Documentation */}
      <Card>
        <CardContent className="p-6 flex flex-col h-full">
          <span className="material-icons text-3xl text-secondary">insert_drive_file</span>
          <h3 className="text-xl font-semibold mt-4">Documentation</h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Access guides, legal templates, and resources for tokenization.
          </p>
          <div className="mt-auto pt-4">
            <Button variant="link" className="text-primary flex items-center p-0">
              View Resources
              <span className="material-icons ml-1">arrow_forward</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Get Support */}
      <Card>
        <CardContent className="p-6 flex flex-col h-full">
          <span className="material-icons text-3xl text-warning">support_agent</span>
          <h3 className="text-xl font-semibold mt-4">Get Support</h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Connect with our team for technical or legal assistance.
          </p>
          <div className="mt-auto pt-4">
            <Button variant="link" className="text-primary flex items-center p-0">
              Contact Support
              <span className="material-icons ml-1">arrow_forward</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickActions;
