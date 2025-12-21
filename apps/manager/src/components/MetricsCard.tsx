import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

interface MetricsCardProps {
  title: string;
  value: number;
}

export const MetricsCard = ({ title, value }: MetricsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-4xl font-bold">{value.toLocaleString()}</p>
      </CardContent>
    </Card>
  );
};
