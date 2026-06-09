"use client";

import type { UseFormReturn } from "react-hook-form";
import { DayOfWeekPicker } from "@/shared/components/ui/dayOfWeekPicker";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/shared/components/ui/toggle-group";
import type { StudentFormValues } from "./studentSchema";

const grades = ["고1", "고2", "고3"] as const;

const gradeToBirthYear = (grade: (typeof grades)[number]) => {
  const gradeNumber = Number.parseInt(grade[1]) + 9;
  return (new Date().getFullYear() - (gradeNumber + 7) + 1).toString();
};

const RequiredMark = () => <span className="text-destructive">*</span>;

export function StudentFormFields({
  form,
  strict = false,
}: {
  form: UseFormReturn<StudentFormValues>;
  strict?: boolean;
}) {
  const birthYear = form.watch("birthYear");
  const activeGrade = grades.map(gradeToBirthYear).includes(birthYear) ? birthYear : "";

  return (
    <Form {...form}>
      <div className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                이름 <RequiredMark />
              </FormLabel>
              <FormControl>
                <Input type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                전화번호 <RequiredMark />
              </FormLabel>
              <FormControl>
                <Input type="tel" placeholder="01012345678" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="parentPhoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>부모님 전화번호 {strict && <RequiredMark />}</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="01012345678" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="school"
          render={({ field }) => (
            <FormItem>
              <FormLabel>학교 {strict && <RequiredMark />}</FormLabel>
              <FormControl>
                <Input type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="branch"
          render={({ field }) => (
            <FormItem>
              <FormLabel>지점 {strict && <RequiredMark />}</FormLabel>
              <FormControl>
                <Input type="text" placeholder="러셀부천" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-end gap-2">
          <FormField
            control={form.control}
            name="birthYear"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>출생년도 {strict && <RequiredMark />}</FormLabel>
                <FormControl>
                  <Input type="number" min="1900" max="2100" placeholder="2010" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <ToggleGroup
            type="single"
            variant="outline"
            value={activeGrade}
            onValueChange={(value) =>
              value && form.setValue("birthYear", value, { shouldValidate: true, shouldDirty: true })
            }>
            {grades.map((grade) => (
              <ToggleGroupItem key={grade} value={gradeToBirthYear(grade)} className="h-9 px-3 text-xs">
                {grade}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <FormField
          control={form.control}
          name="requiredClinicWeekdays"
          render={({ field }) => (
            <DayOfWeekPicker label="클리닉 필참 요일" selectedDays={field.value} onChange={field.onChange} />
          )}
        />
      </div>
    </Form>
  );
}
