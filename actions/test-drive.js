"use server";
import { db } from "@/lib/prisma";
import { serializeCarData } from "@/lib/helpers";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
export async function bookTestDrive({
    carId,
    bookingDate,
    startTime,
    endTime,
    notes,
}) {
    try {
         const {userId} = await auth();
                if(!userId) throw new Error("Unauthorized")
                const user = await db.user.findUnique({
                  where:{clerkUserId:userId}
            });
        
            if(!userId) throw new Error("User Not Found");
        const car = await db.car.findUnique({
            where: { id: carId, status: "AVAILABLE" },
        });

        if(!car) {
            throw new Error("Car not found or not available for test drives.");
        }
     const existingBookings = await db.testDriveBooking.findFirst({
        where:{
            carId,
            bookingDate:new Date(bookingDate),
            startTime,
            status:{in:["PENDING","CONFIRMED"]}
        }
     })
     if(existingBookings) {
        throw new Error("Car is already booked for this time slot.");
     }
        const booking = await db.testDriveBooking.create({
            data: {
                carId,
                userId:user.id,
                bookingDate:new Date(bookingDate),
                startTime,
                endTime,
                notes:notes||null,
                status: "PENDING",
            },
        });
         revalidatePath(`/test-drive/${carId}`);
         revalidatePath(`/ccars/${carId}`);
 

         return {
            success: true,
            message: "Test drive booked successfully.",
            data:booking,
         };
    } catch (error) {
        console.error("Error booking test drive:", error);
        return {
            success: false,
            error: error.message || "An error occurred while booking the test drive.",
        };
    }
}

export async function getUserTestDrives() {
    try {
        const {userId} = await auth();
        if(!userId) throw new Error("Unauthorized")
        const user = await db.user.findUnique({
          where:{clerkUserId:userId}
    });

    if(!userId) throw new Error("User Not Found");
     const bookings = await db.testDriveBooking.findMany({
        where:{
            userId:user.id,
        },
        include:{
            car:true,
        },
        orderBy:{
            bookingDate:"desc",
        },
     
     });
      const formatBooking = bookings.map((booking)=>({
        id:booking.id,   
        carId:booking.carId,
        car:serializeCarData(booking.car),
        bookingDate:booking.bookingDate.toISOString(),
        startTime:booking.startTime,
        endTime:booking.endTime,
        status:booking.status,
        notes:booking.notes,
        createdAt:booking.createdAt.toISOString(),
        updatedAt:booking.updatedAt.toISOString(),
    }));

    return {
        success:true,
        data:formatBooking,
    };

}catch (error) {
    console.error("Error fetching test drive bookings:", error);
    return {
        success: false,
        error: error.message || "An error occurred while fetching test drive bookings.",
    };
}}

export async function cancelTestDrive(bookingId) {
    try {
        const {userId} = await auth();
        if(!userId) throw new Error("Unauthorized")
        const user = await db.user.findUnique({
          where:{clerkUserId:userId}
    });

    if(!userId) throw new Error("User Not Found");
     const booking = await db.testDriveBooking.findUnique({
        where:{
            id:bookingId,
        },
     });
     if(!booking) throw new Error("Booking not found");

     if(booking.status !== "PENDING" || booking.userId !==user.id || user.role !== "ADMIN") throw new Error("Booking cannot be cancelled");

     if(booking.status === "CANCELLED") throw new Error("Booking already cancelled");
     if(booking.status === "COMPLETED") throw new Error("Booking already confirmed");

     await db.testDriveBooking.update({
        where:{
            id:bookingId,
        },
        data:{
            status:"CANCELLED",
        },
     });

     revalidatePath("/reservations");
     revalidatePath("/admin/test-drives");
     return {
        success:true,
        message:"Test drive booking cancelled successfully.",
     }
    }catch (error) {
        console.error("Error cancelling test drive:", error);
        return {
            success: false,
            error: error.message || "An error occurred while cancelling the test drive.",
        };
    }
}