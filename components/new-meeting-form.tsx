"use client";
import React, { ChangeEventHandler, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { newMeetingSchema } from "@/types/new-meeting-schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { setHours, setMinutes } from "date-fns";
import { useAction } from "next-safe-action/hooks";
import { newMeetingAction } from "@/server/actions/new-meeting";
import { useToast } from "@/hooks/use-toast";

const NewMeetingForm = () => {
  const { toast } = useToast();
  const [showNewMeetingForm, setShowNewMeetingForm] = useState(false);
  const [selected, setSelected] = useState<Date>(
    new Date(
      new Date().setDate(
        new Date().getDate() //+ 1
      )
    )
  );
  const [timeValue, setTimeValue] = useState<string>("00:00");
  const { execute, status } = useAction(newMeetingAction, {
    onSuccess: (data) => {
      if (data?.data?.error) {
        toast({ title: data.data.error, variant: "destructive" });
      }
      if (data?.data?.success) {
        toast({
          title: data.data?.success,
          className: "bg-green-500 text-white",
        });
      }
    },
  });

  const form = useForm<z.infer<typeof newMeetingSchema>>({
    resolver: zodResolver(newMeetingSchema),
    defaultValues: {
      title: "",
      description: "",
      date: new Date(
        new Date().setDate(
          new Date().getDate() //+ 1
        )
      ),
    },
  });
  const handleTimeChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const time = e.target.value;
    if (!form.getValues("date")) {
      setTimeValue(time);
      return;
    }
    const [hours, minutes] = time.split(":").map((str) => parseInt(str, 10));
    const newSelectedDate = setHours(
      setMinutes(form.getValues("date"), minutes),
      hours
    );
    setSelected(newSelectedDate);
    form.setValue("date", newSelectedDate);
  };

  const handleDaySelect = (date: Date | undefined) => {
    if (!timeValue || !date) {
      if (date) {
        setSelected(date);
      }
      return;
    }
    const [hours, minutes] = timeValue
      .split(":")
      .map((str) => parseInt(str, 10));
    const newDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      form.getValues("date").getHours(),
      form.getValues("date").getMinutes()
    );
    setSelected(newDate);
    form.setValue("date", newDate);
  };

  function onSubmit(values: z.infer<typeof newMeetingSchema>) {
    execute(values);
  }
  return (
    <>
      <Button
        onClick={() => setShowNewMeetingForm((prev) => !prev)}
        className="mb-4"
      >
        {!showNewMeetingForm ? "Create a new meeting" : "Cancel"}
      </Button>
      {showNewMeetingForm && (
        <div className="rounded-md border-gray-400 bg-white border shadow-md p-3 mb-3">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col space-y-4"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-black">Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Politics debate" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-black">
                      Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="A debate about the pros and cons of the European Union"
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="dark:text-black">
                      Date of meeting
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[280px] justify-start text-left font-normal",
                            !form.getValues("date") && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {form.getValues("date") ? (
                            format(form.getValues("date"), "PPPp")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <div className="w-full flex justify-center items-center">
                          <label>
                            Set the time:{" "}
                            <input
                              type="time"
                              value={
                                form.getValues("date")
                                  ? format(form.getValues("date"), "HH:mm")
                                  : timeValue
                              }
                              onChange={handleTimeChange}
                            />
                          </label>
                        </div>
                        <Calendar
                          mode="single"
                          selected={selected}
                          onSelect={handleDaySelect}
                          fromDate={
                            new Date(
                              new Date().setDate(
                                new Date().getDate() // + 1
                              )
                            )
                          }
                          defaultMonth={form.getValues("date") ?? new Date()}
                        />
                      </PopoverContent>
                    </Popover>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Submit</Button>
            </form>
          </Form>
        </div>
      )}
    </>
  );
};

export default NewMeetingForm;
