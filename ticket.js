const { channel } = require("diagnostics_channel");
const {
  Discord,
  Client,
  MessageEmbed,
  WebhookClient,
  Intents,
  Message,
  Guild,
  ClientUser,
  Channel,
  GuildAuditLogs,
  Role,
} = require("discord.js");
const { send } = require("process");
const { text } = require("stream/consumers");

const client = new Client({ intents: 32767 });
client.setMaxListeners(0);
var prefix = "!";

client.on("messageCreate", (msg) => {
  //args[1] should be a catagory id eg `!setup 125675487543`
  const args = msg.content.trim().split(/ +/g);
  let name = "tickets";
  let channel = msg.guild.channels.cache.get(args[1]);
  if (msg.content.startsWith(`${prefix}setup`)) {
    msg.guild.channels.create(`${name}`, {
      type: "GUILD_TEXT",
      parent: channel,
      permissionOverwrites: [
        {
          id: msg.guild.id,
          allow: ["SEND_MESSAGES", "VIEW_CHANNEL", "READ_MESSAGE_HISTORY"],
        },
      ],
    });
    setTimeout(() => {
      let embed = new MessageEmbed()
        .setTitle("Support")
        .addFields({
          name: "Command",
          value: "Use the command `!ticket` to open a ticket",
        })
        .setTimestamp()
        .setFooter({
          iconURL: client.user.displayAvatarURL({ dynamic: true }),
          text: "Tickets#5374",
        });
      let TicketChannel = msg.guild.channels.cache.find(
        (channel) => channel.name.toLowerCase() === "tickets"
      );
      TicketChannel.send({ embeds: [embed] });
    }, 1000);
  }
});

client.on("messageCreate", (msg) => {
  if (msg.content.includes(`${prefix}close`)) {
    if (msg.author == client.user) {
      return;
    } else {
      msg.channel.delete();
    }
  }
  if (msg.channel.name == "tickets") {
    const args = msg.content.trim().split(/ +/g);
    let channel = msg.guild.channels.cache.find(
      (c) => c.name.toLocaleLowerCase() === "tickets support"
    );
    let guild = msg.guild;
    let ticket = guild.channels.cache.find((channel) =>
      channel.name.includes(`${msg.author.id}`)
    );
    if (!msg.content.includes(`${prefix}ticket`)) {
      if (msg.author == client.user) {
        return;
      } else {
        msg.delete();
      }
    } else if (ticket) {
      msg.channel.send(`if seems you already have a ticket in ${ticket}`).then(
        setTimeout(() => {
          msg.channel.bulkDelete(2);
        }, 6000)
      );
    } else if (msg.content == `${prefix}ticket`) {
      let support_channel = guild.channels.cache.find(
        (c) => c.name == "tickets"
      );
      let support_role = guild.roles.cache.find(
        (r) => r.name.toLocaleLowerCase() == "support"
      );
      if (support_channel) {
        msg.delete();
        msg.guild.channels.create(`${msg.author.id}`, {
          type: "GUILD_TEXT",
          parent: channel,
          permissionOverwrites: [
            {
              id: support_role,
              allow: ["SEND_MESSAGES", "VIEW_CHANNEL", "READ_MESSAGE_HISTORY"],
            },
            {
              id: msg.author.id,
              allow: ["SEND_MESSAGES", "VIEW_CHANNEL", "READ_MESSAGE_HISTORY"],
            },
            {
              id: msg.guild.id,
              deny: ["SEND_MESSAGES", "VIEW_CHANNEL", "READ_MESSAGE_HISTORY"],
            },
          ],
        });
        setTimeout(() => {
          let user_ticket = msg.guild.channels.cache.find((channel) =>
            channel.name.includes(`${msg.author.id}`)
          );
          let embed = new MessageEmbed()
            .setTitle(`${msg.author.username}'s Ticket`)
            .addFields({
              name: "ETA",
              value:
                "Staff have been notified and will be with you shortly. Use `!close` when finished with the ticket",
            })
            .setTimestamp()
            .setFooter({
              iconURL: client.user.displayAvatarURL({ dynamic: true }),
              text: "Tickets#5374",
            });
          user_ticket.send({ embeds: [embed] });
          user_ticket.send(`${msg.author.toString()}`);
          let log = msg.guild.channels.cache.find(
            (c) => c.name.toLocaleLowerCase() == "ticket-logs"
          );
          let logembed = new MessageEmbed()
            .setTitle(`A ticket has been created`)
            .addFields(
              { name: "Ticket", value: `${user_ticket}` },
              { name: "User", value: `${msg.author.tag}` },
              {
                name: "ETA",
                value: `respond to this ticket ASAP`,
              }
            )
            .setTimestamp()
            .setFooter({
              iconURL: client.user.displayAvatarURL({ dynamic: true }),
              text: "Tickets#5374",
            });
          log.send({ embeds: [logembed] });
          log.send(`${support_role}`);
        }, 3000);
      } else {
        msg.reply("Please use this in <#989655983494168687>");
      }
    }
  } else return;
});

client.on("messageCreate", (msg) => {
  if (msg.content.startsWith(`${prefix}ticketlogs`)) {
    let supportRole = msg.guild.roles.cache.find(
      (r) => r.name.toLocaleLowerCase() == "support"
    );
    msg.guild.channels
      .create(`Ticket Info`, {
        type: "GUILD_CATEGORY",
        permissionOverwrites: [
          {
            id: supportRole,
            allow: ["SEND_MESSAGES", "VIEW_CHANNEL", "READ_MESSAGE_HISTORY"],
          },
          {
            id: msg.guild.id,
            deny: ["SEND_MESSAGES", "VIEW_CHANNEL", "READ_MESSAGE_HISTORY"],
          },
        ],
      })
      .then((catagory) =>
        msg.guild.channels.create(`Ticket logs`, {
          type: "GUILD_TEXT",
          parent: catagory,
          permissionOverwrites: [
            {
              id: supportRole,
              allow: ["SEND_MESSAGES", "VIEW_CHANNEL", "READ_MESSAGE_HISTORY"],
            },
            {
              id: msg.guild.id,
              deny: ["SEND_MESSAGES", "VIEW_CHANNEL", "READ_MESSAGE_HISTORY"],
            },
          ],
        })
      );
  }
  // const args = msg.content.trim().split(/ +/g);
  // let Ticket_Info = msg.guild.channels.cache.find(
  //   (c) => c.name.toLocaleLowerCase() === "ticket info"
  // );
  // let supportRole = msg.guild.roles.cache.find(
  //   (r) => r.name.toLocaleLowerCase() == "support"
  // );

  // let ticket_support_log = msg.guild.channels.cache.find((c) =>
  //   c.name.includes("ticket support log")
  // );
  // // let guild = client.guilds.cache.find((n) => n.id == "989632289518530560");
  // if (msg.content.includes(`${prefix}log`)) {
  //   msg.guild.channels.create(`ticket`, {
  //     type: "GUILD_TEXT",
  //     parent: Ticket_Info,
  //     permissionOverwrites: [
  //       {
  //         id: supportRole,
  //         allow: ["SEND_MESSAGES", "VIEW_CHANNEL", "READ_MESSAGE_HISTORY"],
  //       },
  //       {
  //         id: msg.guild.id,
  //         deny: ["SEND_MESSAGES", "VIEW_CHANNEL", "READ_MESSAGE_HISTORY"],
  //       },
  //     ],
  //   });
  //   if (msg.content == `${prefix}ticket`)
  //     ticket_support_log.send(`${supportRole} a new ticket has been opened`);
  // }
});

client.login(
  "OTg5NTUwNDc3NDkyNTA2Njc0.G92Fa9.CzMz3QZc0Y1Y_fPUvF9PnF6Rz8AZ_tN-uQd3GM"
);
