
import React from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { OrderType } from '@/types/order';

interface OrderCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date | undefined) => void;
  calendarOrders: { [date: string]: OrderType[] };
}

const OrderCalendar: React.FC<OrderCalendarProps> = ({
  selectedDate,
  onDateSelect,
  calendarOrders,
}) => {
  const renderDayContent = (day: Date) => {
    const dateString = format(day, 'yyyy-MM-dd');
    const dayOrders = calendarOrders[dateString] || [];
    const pendingOrders = dayOrders.filter(order => order.status === 'pending').length;

    if (dayOrders.length > 0) {
      return (
        <div className="flex flex-col items-center">
          <div>{format(day, 'd')}</div>
          {pendingOrders > 0 && (
            <Badge variant="secondary" className="mt-1">
              {pendingOrders}
            </Badge>
          )}
        </div>
      );
    }

    return <div>{format(day, 'd')}</div>;
  };

  return (
    <div className="flex justify-center">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={onDateSelect}
        className="rounded-md border w-full pointer-events-auto"
        modifiersStyles={{
          selected: { fontWeight: "bold" }
        }}
        components={{
          DayContent: ({ date }) => renderDayContent(date)
        }}
      />
    </div>
  );
};

export default OrderCalendar;
