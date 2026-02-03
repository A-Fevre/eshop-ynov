using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Discount.Grpc.Migrations
{
    /// <inheritdoc />
    public partial class AddDiscountLifecycle : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Coupon",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.RenameColumn(
                name: "ProductName",
                table: "Coupon",
                newName: "StartDate");

            migrationBuilder.RenameColumn(
                name: "Amount",
                table: "Coupon",
                newName: "Value");

            migrationBuilder.AddColumn<string>(
                name: "Code",
                table: "Coupon",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "EndDate",
                table: "Coupon",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<bool>(
                name: "IsCumulative",
                table: "Coupon",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Coupon",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<double>(
                name: "MinimumOrderAmount",
                table: "Coupon",
                type: "REAL",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "Coupon",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "Coupon",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.UpdateData(
                table: "Coupon",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Code", "Description", "EndDate", "IsCumulative", "IsDeleted", "MinimumOrderAmount", "StartDate", "Status", "Type", "Value" },
                values: new object[] { "WELCOME10", "Bienvenue", new DateTime(2026, 12, 31, 23, 59, 59, 0, DateTimeKind.Utc), false, false, 50.0, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, 1, 10.0 });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Code",
                table: "Coupon");

            migrationBuilder.DropColumn(
                name: "EndDate",
                table: "Coupon");

            migrationBuilder.DropColumn(
                name: "IsCumulative",
                table: "Coupon");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Coupon");

            migrationBuilder.DropColumn(
                name: "MinimumOrderAmount",
                table: "Coupon");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Coupon");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "Coupon");

            migrationBuilder.RenameColumn(
                name: "Value",
                table: "Coupon",
                newName: "Amount");

            migrationBuilder.RenameColumn(
                name: "StartDate",
                table: "Coupon",
                newName: "ProductName");

            migrationBuilder.UpdateData(
                table: "Coupon",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Amount", "Description", "ProductName" },
                values: new object[] { 150.0, "IPhone X New", "IPhone X" });

            migrationBuilder.InsertData(
                table: "Coupon",
                columns: new[] { "Id", "Amount", "Description", "ProductName" },
                values: new object[] { 2, 100.0, "Samsung 10 New", "Samsung 10" });
        }
    }
}
